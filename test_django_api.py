#!/usr/bin/env python3
"""
Simple script to test Django API endpoints
Run this to verify your Django backend is working
"""

import requests
import json

# Configuration
BASE_URL = "http://127.0.0.1:8000"
API_BASE = f"{BASE_URL}/api/v1/grads"

def test_endpoint(endpoint, method="GET", data=None, headers=None):
    """Test a single API endpoint"""
    url = f"{API_BASE}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        
        print(f"\n{method} {url}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2)}")
            except:
                print(f"Response: {response.text}")
        elif response.status_code == 401:
            print(f"✅ Endpoint exists but requires authentication (expected)")
        else:
            print(f"Error: {response.text}")
            
        return response.status_code in [200, 401]  # 401 is also success for protected endpoints
        
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection Error: Could not connect to {url}")
        print("Make sure your Django server is running on http://127.0.0.1:8000")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("🧪 Testing Django Grades API Endpoints")
    print("=" * 50)
    
    # Test basic connectivity
    print("\n1. Testing basic connectivity...")
    try:
        response = requests.get(BASE_URL)
        print(f"✅ Django server is running (Status: {response.status_code})")
    except:
        print("❌ Django server is not running!")
        print("Please start your Django server with: python manage.py runserver")
        return
    
    # Test health endpoint
    print("\n2. Testing health endpoint...")
    test_endpoint("/health/")
    
    # Test grade scales endpoint
    print("\n3. Testing grade scales endpoint...")
    test_endpoint("/grade-scales/")
    
    # Test midterm grades endpoint
    print("\n4. Testing midterm grades endpoint...")
    test_endpoint("/midterm-grades/")
    
    # Test semester grades endpoint
    print("\n5. Testing semester grades endpoint...")
    test_endpoint("/semester-grades/")
    
    # Test SGPA endpoint
    print("\n6. Testing SGPA endpoint...")
    test_endpoint("/semester-gpas/")
    
    # Test CGPA endpoint
    print("\n7. Testing CGPA endpoint...")
    test_endpoint("/cumulative-gpas/")
    
    print("\n" + "=" * 50)
    print("🏁 Testing complete!")
    print("\nIf you see 404 errors, the endpoints are not implemented yet.")
    print("If you see 500 errors, there are server-side issues.")
    print("Check the django_grades_api_implementation.md file for implementation guide.")

if __name__ == "__main__":
    main()
