# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Load testing configuration for CodexOS API
"""

from locust import HttpUser, task, between
import random
import json


class CodexOSUser(HttpUser):
    """Simulated user for load testing"""
    
    wait_time = between(1, 3)  # Wait 1-3 seconds between tasks
    
    def on_start(self):
        """Login and get auth token"""
        # Create test user or login
        response = self.client.post(
            "/api/v1/auth/login",
            json={
                "username": "loadtest@example.com",
                "password": "loadtestpassword"
            }
        )
        
        if response.status_code == 200:
            self.token = response.json()["access_token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            # Try to register first
            self.client.post(
                "/api/v1/users/",
                json={
                    "email": "loadtest@example.com",
                    "username": "loadtest",
                    "password": "loadtestpassword",
                    "full_name": "Load Test User"
                }
            )
            # Then login
            self.on_start()
    
    @task(3)
    def browse_marketplace(self):
        """Browse marketplace items"""
        # Get categories
        self.client.get("/api/v1/marketplace/categories")
        
        # Search items
        search_terms = ["ai", "agent", "data", "tool", "security"]
        query = random.choice(search_terms)
        self.client.get(f"/api/v1/marketplace/items?q={query}")
        
        # Get popular items
        self.client.get("/api/v1/marketplace/items?sort_by=popular&limit=10")
    
    @task(2)
    def view_item_details(self):
        """View marketplace item details"""
        # Get a random item (in real scenario, would get from previous browse)
        item_ids = ["item1", "item2", "item3", "item4", "item5"]
        item_id = random.choice(item_ids)
        
        with self.client.get(
            f"/api/v1/marketplace/items/{item_id}",
            catch_response=True
        ) as response:
            if response.status_code == 404:
                response.success()  # Don't fail on 404
    
    @task(1)
    def execute_agent(self):
        """Execute an agent flow"""
        if hasattr(self, 'headers'):
            flow_data = {
                "nodes": [
                    {
                        "id": "entry",
                        "type": "entry",
                        "data": {"label": "Start"},
                        "position": {"x": 100, "y": 100}
                    },
                    {
                        "id": "llm",
                        "type": "llm",
                        "data": {
                            "model": "gpt-3.5-turbo",
                            "prompt": "Hello, how are you?"
                        },
                        "position": {"x": 300, "y": 100}
                    },
                    {
                        "id": "exit",
                        "type": "exit",
                        "data": {"label": "End"},
                        "position": {"x": 500, "y": 100}
                    }
                ],
                "edges": [
                    {"source": "entry", "target": "llm"},
                    {"source": "llm", "target": "exit"}
                ]
            }
            
            self.client.post(
                "/api/v1/agents/execute",
                json=flow_data,
                headers=self.headers
            )
    
    @task(2)
    def rag_query(self):
        """Query RAG engine"""
        if hasattr(self, 'headers'):
            queries = [
                "How do I create an agent?",
                "What is CodexOS?",
                "How to use the marketplace?",
                "What are the system requirements?",
                "How to integrate with external APIs?"
            ]
            
            query = random.choice(queries)
            self.client.post(
                "/api/v1/rag/query",
                json={"query": query, "limit": 5},
                headers=self.headers
            )
    
    @task(1)
    def health_check(self):
        """Check system health"""
        self.client.get("/health")
        
        # Detailed health check (less frequent)
        if random.random() < 0.2:
            self.client.get("/health/detailed")


class MarketplaceSellerUser(HttpUser):
    """Simulated marketplace seller"""
    
    wait_time = between(2, 5)
    
    def on_start(self):
        """Login as seller"""
        response = self.client.post(
            "/api/v1/auth/login",
            json={
                "username": "seller@example.com",
                "password": "sellerpassword"
            }
        )
        
        if response.status_code == 200:
            self.token = response.json()["access_token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
    
    @task(3)
    def check_dashboard(self):
        """Check seller dashboard"""
        if hasattr(self, 'headers'):
            # Get my items
            self.client.get("/api/v1/marketplace/my-items", headers=self.headers)
            
            # Get my purchases
            self.client.get("/api/v1/marketplace/my-purchases", headers=self.headers)
    
    @task(1)
    def create_item(self):
        """Create new marketplace item"""
        if hasattr(self, 'headers'):
            item_data = {
                "name": f"Test Agent {random.randint(1000, 9999)}",
                "short_description": "A test agent for load testing",
                "long_description": "This is a longer description for the test agent",
                "item_type": "agent_template",
                "pricing_model": random.choice(["free", "one_time", "subscription"]),
                "price": random.choice([0, 9.99, 29.99, 99.99]),
                "tags": ["test", "load-test", "agent"]
            }
            
            self.client.post(
                "/api/v1/marketplace/items",
                json=item_data,
                headers=self.headers
            )
    
    @task(2)
    def update_item(self):
        """Update existing item"""
        if hasattr(self, 'headers'):
            # In real scenario, would get actual item IDs
            item_id = f"item-{random.randint(1, 100)}"
            
            update_data = {
                "short_description": f"Updated description at {random.randint(1000, 9999)}"
            }
            
            with self.client.put(
                f"/api/v1/marketplace/items/{item_id}",
                json=update_data,
                headers=self.headers,
                catch_response=True
            ) as response:
                if response.status_code in [404, 403]:
                    response.success()  # Don't fail on not found or forbidden


class AdminUser(HttpUser):
    """Simulated admin user for monitoring"""
    
    wait_time = between(5, 10)
    
    @task
    def check_metrics(self):
        """Check system metrics"""
        self.client.get("/metrics")
    
    @task
    def check_health(self):
        """Check detailed health"""
        self.client.get("/health/detailed")
    
    @task
    def check_stats(self):
        """Check marketplace stats"""
        self.client.get("/api/v1/marketplace/stats")
