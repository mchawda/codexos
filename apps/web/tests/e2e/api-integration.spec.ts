// SPDX-License-Identifier: LicenseRef-NIA-Proprietary
import { test, expect } from '@playwright/test'

test.describe('API Integration Tests', () => {
  const API_BASE = 'http://localhost:8000/api/v1'
  let authToken: string

  test.beforeAll(async ({ request }) => {
    // Get authentication token for API tests
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: 'test@example.com',
        password: 'TestPassword123!'
      }
    })
    
    if (response.ok()) {
      const data = await response.json()
      authToken = data.access_token
    }
  })

  test('Authentication API endpoints', async ({ request }) => {
    // 1. Test user registration
    const registerResponse = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `api-test-${Date.now()}@example.com`,
        password: 'ApiTestPassword123!',
        full_name: 'API Test User'
      }
    })
    
    expect(registerResponse.ok()).toBeTruthy()
    const registerData = await registerResponse.json()
    expect(registerData.email).toBeTruthy()
    expect(registerData.id).toBeTruthy()

    // 2. Test user login
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: `api-test-${Date.now()}@example.com`,
        password: 'ApiTestPassword123!'
      }
    })
    
    expect(loginResponse.ok()).toBeTruthy()
    const loginData = await loginResponse.json()
    expect(loginData.access_token).toBeTruthy()
    expect(loginData.token_type).toBe('bearer')

    // 3. Test token refresh
    const refreshResponse = await request.post(`${API_BASE}/auth/refresh`, {
      headers: {
        'Authorization': `Bearer ${loginData.access_token}`
      }
    })
    
    expect(refreshResponse.ok()).toBeTruthy()
  })

  test('User management API endpoints', async ({ request }) => {
    // 1. Test get current user
    const userResponse = await request.get(`${API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    expect(userResponse.ok()).toBeTruthy()
    const userData = await userResponse.json()
    expect(userData.email).toBeTruthy()
    expect(userData.id).toBeTruthy()

    // 2. Test update user profile
    const updateResponse = await request.put(`${API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        full_name: 'Updated API Test User',
        bio: 'User updated via API testing'
      }
    })
    
    expect(updateResponse.ok()).toBeTruthy()
    const updateData = await updateResponse.json()
    expect(updateData.full_name).toBe('Updated API Test User')

    // 3. Test change password
    const passwordResponse = await request.put(`${API_BASE}/users/me/password`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        current_password: 'TestPassword123!',
        new_password: 'NewApiTestPassword123!'
      }
    })
    
    expect(passwordResponse.ok()).toBeTruthy()
  })

  test('Agent management API endpoints', async ({ request }) => {
    // 1. Test create agent
    const createAgentResponse = await request.post(`${API_BASE}/agents`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        name: 'API Test Agent',
        description: 'Agent created via API testing',
        agent_type: 'task',
        configuration: {
          model: 'gpt-4',
          temperature: 0.7
        }
      }
    })
    
    expect(createAgentResponse.ok()).toBeTruthy()
    const agentData = await createAgentResponse.json()
    expect(agentData.name).toBe('API Test Agent')
    expect(agentData.id).toBeTruthy()

    const agentId = agentData.id

    // 2. Test get agent
    const getAgentResponse = await request.get(`${API_BASE}/agents/${agentId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    expect(getAgentResponse.ok()).toBeTruthy()
    const getAgentData = await getAgentResponse.json()
    expect(getAgentData.id).toBe(agentId)

    // 3. Test update agent
    const updateAgentResponse = await request.put(`${API_BASE}/agents/${agentId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        description: 'Updated agent description via API',
        configuration: {
          model: 'gpt-4',
          temperature: 0.5
        }
      }
    })
    
    expect(updateAgentResponse.ok()).toBeTruthy()
    const updateAgentData = await updateAgentResponse.json()
    expect(updateAgentData.description).toBe('Updated agent description via API')

    // 4. Test list agents
    const listAgentsResponse = await request.get(`${API_BASE}/agents`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    expect(listAgentsResponse.ok()).toBeTruthy()
    const listAgentsData = await listAgentsResponse.json()
    expect(Array.isArray(listAgentsData)).toBeTruthy()
    expect(listAgentsData.length).toBeGreaterThan(0)

    // 5. Test delete agent
    const deleteAgentResponse = await request.delete(`${API_BASE}/agents/${agentId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    expect(deleteAgentResponse.ok()).toBeTruthy()
  })

  test('Marketplace API endpoints', async ({ request }) => {
    // 1. Test list marketplace items
    const listItemsResponse = await request.get(`${API_BASE}/marketplace/items`)
    
    expect(listItemsResponse.ok()).toBeTruthy()
    const itemsData = await listItemsResponse.json()
    expect(Array.isArray(itemsData)).toBeTruthy()

    if (itemsData.length > 0) {
      const itemId = itemsData[0].id

      // 2. Test get marketplace item
      const getItemResponse = await request.get(`${API_BASE}/marketplace/items/${itemId}`)
      
      expect(getItemResponse.ok()).toBeTruthy()
      const itemData = await getItemResponse.json()
      expect(itemData.id).toBe(itemId)

      // 3. Test create purchase (if authenticated)
      if (authToken) {
        const purchaseResponse = await request.post(`${API_BASE}/marketplace/purchases`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          data: {
            item_id: itemId,
            quantity: 1
          }
        })
        
        // This might fail if item requires payment, but should not crash
        expect(purchaseResponse.status()).toBeLessThan(500)
      }
    }
  })

  test('RAG engine API endpoints', async ({ request }) => {
    // 1. Test RAG engine health
    const healthResponse = await request.get(`${API_BASE}/rag/health`)
    
    expect(healthResponse.ok()).toBeTruthy()
    const healthData = await healthResponse.json()
    expect(healthData.status).toBeTruthy()

    // 2. Test document upload
    const testDocument = Buffer.from('This is a test document for RAG engine API testing.')
    const uploadResponse = await request.post(`${API_BASE}/rag/documents`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'multipart/form-data'
      },
      data: {
        file: {
          name: 'test-document.txt',
          mimeType: 'text/plain',
          buffer: testDocument
        },
        metadata: {
          title: 'API Test Document',
          description: 'Document uploaded via API testing'
        }
      }
    })
    
    expect(uploadResponse.ok()).toBeTruthy()
    const uploadData = await uploadResponse.json()
    expect(uploadData.document_id).toBeTruthy()

    const documentId = uploadData.document_id

    // 3. Test document search
    const searchResponse = await request.post(`${API_BASE}/rag/search`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        query: 'test document',
        top_k: 5
      }
    })
    
    expect(searchResponse.ok()).toBeTruthy()
    const searchData = await searchResponse.json()
    expect(Array.isArray(searchData.results)).toBeTruthy()

    // 4. Test get document
    const getDocResponse = await request.get(`${API_BASE}/rag/documents/${documentId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    expect(getDocResponse.ok()).toBeTruthy()
    const docData = await getDocResponse.json()
    expect(docData.id).toBe(documentId)

    // 5. Test delete document
    const deleteDocResponse = await request.delete(`${API_BASE}/rag/documents/${documentId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    expect(deleteDocResponse.ok()).toBeTruthy()
  })

  test('Stripe payment API endpoints', async ({ request }) => {
    if (!authToken) {
      test.skip('Authentication required for payment tests')
      return
    }

    // 1. Test create checkout session
    const checkoutResponse = await request.post(`${API_BASE}/stripe/create-checkout-session`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        item_id: 'test-item-id',
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel'
      }
    })
    
    // This might fail in test environment, but should not crash
    expect(checkoutResponse.status()).toBeLessThan(500)

    // 2. Test get session details
    if (checkoutResponse.ok()) {
      const checkoutData = await checkoutResponse.json()
      const sessionId = checkoutData.session_id

      const sessionResponse = await request.get(`${API_BASE}/stripe/session-details?session_id=${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      expect(sessionResponse.ok()).toBeTruthy()
    }
  })

  test('Error handling and validation', async ({ request }) => {
    // 1. Test invalid authentication
    const invalidAuthResponse = await request.get(`${API_BASE}/users/me`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    })
    
    expect(invalidAuthResponse.status()).toBe(401)

    // 2. Test missing required fields
    const missingFieldsResponse = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: 'incomplete@example.com'
        // Missing password and full_name
      }
    })
    
    expect(missingFieldsResponse.status()).toBe(422)

    // 3. Test invalid data types
    const invalidDataResponse = await request.post(`${API_BASE}/agents`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        name: 123, // Should be string
        description: 'Valid description',
        agent_type: 'invalid_type'
      }
    })
    
    expect(invalidDataResponse.status()).toBe(422)

    // 4. Test resource not found
    const notFoundResponse = await request.get(`${API_BASE}/agents/nonexistent-id`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    expect(notFoundResponse.status()).toBe(404)
  })

  test('Rate limiting and security', async ({ request }) => {
    // 1. Test rate limiting on auth endpoints
    const promises = []
    for (let i = 0; i < 10; i++) {
      promises.push(
        request.post(`${API_BASE}/auth/login`, {
          data: {
            email: `rate-test-${i}@example.com`,
            password: 'wrongpassword'
          }
        })
      )
    }
    
    const responses = await Promise.all(promises)
    const rateLimited = responses.some(r => r.status() === 429)
    
    // At least some requests should be rate limited
    expect(rateLimited).toBeTruthy()

    // 2. Test CORS headers
    const corsResponse = await request.get(`${API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Origin': 'http://localhost:3000'
      }
    })
    
    expect(corsResponse.headers()['access-control-allow-origin']).toBeTruthy()

    // 3. Test security headers
    const securityResponse = await request.get(`${API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    expect(securityResponse.headers()['x-content-type-options']).toBe('nosniff')
    expect(securityResponse.headers()['x-frame-options']).toBeTruthy()
  })

  test('Performance and load testing', async ({ request }) => {
    // 1. Test response time for simple endpoint
    const startTime = Date.now()
    const response = await request.get(`${API_BASE}/rag/health`)
    const responseTime = Date.now() - startTime
    
    expect(response.ok()).toBeTruthy()
    expect(responseTime).toBeLessThan(1000) // Should respond within 1 second

    // 2. Test concurrent requests
    const concurrentPromises = []
    for (let i = 0; i < 5; i++) {
      concurrentPromises.push(
        request.get(`${API_BASE}/rag/health`)
      )
    }
    
    const concurrentResponses = await Promise.all(concurrentPromises)
    const allSuccessful = concurrentResponses.every(r => r.ok())
    
    expect(allSuccessful).toBeTruthy()

    // 3. Test large payload handling
    const largePayload = {
      query: 'a'.repeat(10000), // Very long query
      top_k: 100
    }
    
    const largePayloadResponse = await request.post(`${API_BASE}/rag/search`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: largePayload
    })
    
    // Should handle large payloads gracefully
    expect(largePayloadResponse.status()).toBeLessThan(500)
  })
})
