# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
#!/usr/bin/env python3
"""Test script for agent execution history and logs endpoints"""

import asyncio
import httpx
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

async def test_agent_history_endpoints():
    """Test the new agent history and logs endpoints"""
    
    async with httpx.AsyncClient() as client:
        print("🧪 Testing Agent Execution History Endpoints")
        print("=" * 50)
        
        # Test 1: Get agent execution history (all agents)
        print("\n1. Testing GET /agents/history (all agents)")
        try:
            response = await client.get(f"{API_BASE}/agents/history")
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"   Response: {len(data)} execution records")
                if data:
                    print(f"   Sample record: {json.dumps(data[0], indent=2, default=str)}")
            else:
                print(f"   Error: {response.text}")
        except Exception as e:
            print(f"   Error: {e}")
        
        # Test 2: Get agent execution history for specific agent
        print("\n2. Testing GET /agents/history?agent_id=bug-triager")
        try:
            response = await client.get(f"{API_BASE}/agents/history?agent_id=bug-triager")
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"   Response: {len(data)} execution records for bug-triager")
            else:
                print(f"   Error: {response.text}")
        except Exception as e:
            print(f"   Error: {e}")
        
        # Test 3: Get execution logs (requires a valid run_id)
        print("\n3. Testing GET /agents/logs?run_id=<run_id>")
        print("   Note: This requires a valid execution run_id from the history endpoint")
        
        # Test 4: Test with pagination
        print("\n4. Testing GET /agents/history with pagination")
        try:
            response = await client.get(f"{API_BASE}/agents/history?skip=0&limit=5")
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"   Response: {len(data)} execution records (limited to 5)")
        except Exception as e:
            print(f"   Error: {e}")
        
        print("\n" + "=" * 50)
        print("✅ Testing completed!")
        print("\nTo test the logs endpoint, you'll need to:")
        print("1. Run some agent executions first")
        print("2. Get a run_id from the history endpoint")
        print("3. Use that run_id to test the logs endpoint")

if __name__ == "__main__":
    asyncio.run(test_agent_history_endpoints())
