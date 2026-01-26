#!/usr/bin/env python3
"""
CORS Test Script
Tests if CORS is properly configured on the backend
"""
import httpx
import asyncio
from datetime import datetime

async def test_cors():
    """Test CORS configuration"""
    
    print("=" * 60)
    print("CORS Configuration Test")
    print("=" * 60)
    
    backend_url = "http://localhost:8000"
    frontend_origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
    
    async with httpx.AsyncClient() as client:
        for origin in frontend_origins:
            print(f"\nTesting origin: {origin}")
            print("-" * 60)
            
            try:
                # Test OPTIONS preflight request
                response = await client.options(
                    f"{backend_url}/projects/",
                    headers={"Origin": origin}
                )
                
                print(f"Status: {response.status_code}")
                print("\nResponse Headers:")
                cors_headers = {
                    k: v for k, v in response.headers.items() 
                    if k.lower().startswith('access-control')
                }
                
                if cors_headers:
                    for key, value in cors_headers.items():
                        print(f"  {key}: {value}")
                else:
                    print("  ⚠️  No CORS headers found!")
                
                # Check specific headers
                checks = {
                    "access-control-allow-origin": origin,
                    "access-control-allow-credentials": "true",
                    "access-control-allow-methods": "DELETE",  # Check if DELETE is allowed
                }
                
                print("\nCORS Checks:")
                for header, expected_value in checks.items():
                    actual_value = response.headers.get(header, "NOT FOUND")
                    if header == "access-control-allow-methods":
                        # Check if DELETE is in the methods
                        is_ok = "DELETE" in actual_value.upper() or "*" in actual_value
                    else:
                        is_ok = expected_value.lower() in actual_value.lower()
                    
                    status_icon = "✓" if is_ok else "✗"
                    print(f"  {status_icon} {header}")
                    print(f"      Expected: {expected_value}")
                    print(f"      Actual:   {actual_value}")
                
            except Exception as e:
                print(f"❌ Error: {e}")
    
    print("\n" + "=" * 60)
    print("Test Complete")
    print("=" * 60)
    print("\nIf all checks show ✓, CORS is properly configured!")
    print("If you see ✗, the backend might need to be restarted.")

if __name__ == "__main__":
    asyncio.run(test_cors())
