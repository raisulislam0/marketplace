# CORS Error Troubleshooting Guide

## What is a CORS Error?

CORS (Cross-Origin Resource Sharing) errors occur when a web page tries to make requests to an API on a different domain/port than the page itself.

**Example:**
- Frontend running on: `http://localhost:3001`
- Backend API on: `http://localhost:8000`
- Result: CORS error (different ports = different origins)

---

## How We Fixed It

### Backend Changes (app/main.py)

Updated the CORS middleware to:
1. Accept requests from multiple localhost variants:
   - `http://localhost:3000` (default Next.js port)
   - `http://localhost:3001` (when port 3000 is busy)
   - `http://127.0.0.1:3000` and `3001` (IP version)
   - `http://localhost:8000` (self-requests)

2. Allow all necessary HTTP methods:
   - GET, POST, PUT, PATCH, DELETE, OPTIONS

3. Allow required headers:
   - Content-Type
   - Authorization (for Bearer tokens)
   - Accept
   - Origin
   - Access-Control-Request-Method
   - Access-Control-Request-Headers

### Frontend Changes (src/lib/api.ts)

Updated the axios configuration to:
1. Add `withCredentials: true` (necessary for cookies and CORS)
2. Include proper Authorization header with Bearer token
3. Add detailed console logging for debugging

---

## How to Verify CORS is Working

### 1. Check the Network Tab (Browser DevTools)

1. Open Browser DevTools (F12 or Ctrl+Shift+I)
2. Go to **Network** tab
3. Make a request (e.g., click "Delete Project")
4. Look for the request in the Network tab

### Expected Headers (Request):
```
Origin: http://localhost:3001
Authorization: Bearer [your-token-here]
Content-Type: application/json
```

### Expected Headers (Response):
```
Access-Control-Allow-Origin: http://localhost:3001
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, ...
```

### 2. Check the Console Tab

1. Open Browser DevTools Console
2. Look for logs from our API interceptor:
   - `Auth token found, setting Authorization header` ✅ Good
   - `No auth token found in localStorage` ⚠️ You might not be logged in
   - `API Error: [status] [data]` ❌ An error occurred

### 3. Look for CORS Errors

If you see errors like:
```
Access to XMLHttpRequest at 'http://localhost:8000/projects/...' from origin 'http://localhost:3001' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

This means:
- The backend didn't send the right CORS headers
- Or the origin (http://localhost:3001) is not in the allowed list

---

## Common CORS Issues and Solutions

### Issue 1: "No 'Access-Control-Allow-Origin' header"

**Cause**: Backend CORS not configured properly or your frontend origin not in allowed list

**Solution**:
1. Check your frontend URL (it's in the browser address bar)
2. Verify this URL is in the backend CORS allowed_origins list
3. If running on a different port, it needs to be explicitly allowed

**Example** - If frontend is on port 3002:
```python
allow_origins=[
    "http://localhost:3002",  # Add this
    # ... other origins
]
```

### Issue 2: "The value of the 'Access-Control-Allow-Credentials' header"

**Cause**: Credentials are being sent but CORS headers don't allow it

**Solution**:
- Backend must have: `allow_credentials=True`
- Frontend must have: `withCredentials: true`
- Both are already configured in our setup

### Issue 3: "Authorization header not allowed"

**Cause**: The Authorization header is not in the allowed headers list

**Solution**:
- Backend must include "Authorization" in allow_headers
- This is already configured

### Issue 4: "OPTIONS request failed"

**Cause**: Browser sends a preflight OPTIONS request but backend doesn't handle it properly

**Solution**:
- Include OPTIONS in allow_methods: ✅ Done
- CORS middleware must be added before route handlers: ✅ Already ordered correctly

---

## Testing with curl (Command Line)

You can test CORS from the command line to isolate frontend issues:

### Get a Token First
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=solver@test.com&password=test123"
```

This returns: `{"access_token": "eyJ...", "token_type": "bearer"}`

### Test a DELETE Request
```bash
curl -X DELETE http://localhost:8000/projects/[project-id] \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3001"
```

**Expected Response**: Status 204 No Content (success) or error with proper CORS headers

---

## Environment Configuration

### Frontend (.env.local)
```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Note**: This file is loaded by Next.js at build time. If you change it:
1. Stop the dev server (Ctrl+C)
2. Start it again (npm run dev)

### Backend (.env)
```dotenv
MONGODB_URL=mongodb+srv://...
DATABASE_NAME=marketplace
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=uploads
```

---

## Debugging Steps

If you still get CORS errors:

1. **Check your frontend URL**: What does your browser address bar show?
   - Example: `http://localhost:3001`, `http://localhost:3000`, etc.

2. **Verify it's in the backend allowed_origins**:
   - If not, add it to backend/app/main.py

3. **Verify you're logged in**:
   - Check localStorage for 'token'
   - Use Browser DevTools Console: `localStorage.getItem('token')`

4. **Check for auth errors**:
   - If status 401: Token expired or invalid
   - If status 403: Unauthorized (wrong permissions)
   - If status 404: Resource not found

5. **Check the response headers**:
   - Open DevTools Network tab
   - Click on the failed request
   - Go to Response Headers tab
   - Look for Access-Control-* headers

6. **Restart both servers**:
   - Stop backend: Ctrl+C
   - Stop frontend: Ctrl+C
   - Start backend: `python run.py`
   - Start frontend: `npm run dev`

---

## All Allowed Origins

After our fix, these origins are allowed:

```python
allow_origins=[
    "http://localhost:3000",      # Default Next.js
    "http://localhost:3001",      # When 3000 is busy
    "http://127.0.0.1:3000",      # IP version
    "http://127.0.0.1:3001",      # IP version
    "http://localhost:8000",      # Self-referential
    "http://127.0.0.1:8000"       # Self-referential IP
]
```

---

## Browser DevTools Tips

### Check Axios Default Headers
In Browser Console:
```javascript
import api from '@/lib/api'
console.log(api.defaults)  // Shows all default configs
```

### Monitor All Network Requests
```javascript
// Logs every request and response
api.interceptors.request.use(config => {
  console.log('Outgoing request:', config);
  return config;
});
```

---

## For Production

When deploying to production, you'll need to:

1. **Update allowed_origins** with your actual domain:
```python
allow_origins=[
    "https://yourdomain.com",
    "https://www.yourdomain.com",
    # ... keep localhost for dev if needed
]
```

2. **Update frontend API URL** in .env:
```dotenv
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

3. **Use HTTPS** everywhere (required for production CORS)

---

## Quick Checklist

- [ ] Frontend is running on correct port
- [ ] Backend is running on port 8000
- [ ] Frontend has token in localStorage
- [ ] Backend CORS has frontend origin in allowed_origins
- [ ] Both servers have `withCredentials` / `allow_credentials` set to true
- [ ] Authorization header is allowed in CORS
- [ ] Browser Network tab shows Access-Control-Allow-Origin header in response
- [ ] Console shows "Auth token found" log message

If all these are checked, CORS should be working!

---

## Need More Help?

1. **Check the error message** - Browser DevTools shows which origin/method/header is blocked
2. **Look at network headers** - Response headers show what CORS settings the backend sent
3. **Check console logs** - Our logging shows whether auth token was found
4. **Restart servers** - Sometimes changes don't take effect without restart
