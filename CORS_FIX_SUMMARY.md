# CORS Error Fix - Complete Solution

## Problem

You were getting CORS (Cross-Origin Resource Sharing) errors when trying to make API requests from the frontend to the backend.

## Root Causes Identified and Fixed

### 1. **Missing Frontend Origins in CORS Config**

- **Problem**: The backend only allowed `localhost:3000` and `localhost:3001`, but your frontend was running on `localhost:3002`
- **Solution**: Added `localhost:3002` (and its IP equivalent `127.0.0.1:3002`) to the allowed origins

### 2. **Incomplete CORS Headers**

- **Problem**: The CORS middleware was using wildcard `["*"]` for methods and headers, which doesn't work properly with credentials
- **Solution**: Explicitly listed all allowed HTTP methods and headers

### 3. **Missing `withCredentials` in Frontend**

- **Problem**: The axios client wasn't configured to send credentials (tokens) across origin boundaries
- **Solution**: Added `withCredentials: true` to the axios configuration

### 4. **Export Duplication in API File**

- **Problem**: The api.ts file had duplicate `export default api` statements
- **Solution**: Removed the duplicate export

---

## Changes Made

### Backend: [backend/app/main.py](backend/app/main.py)

**Updated CORS Configuration:**

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Default Next.js port
        "http://localhost:3001",      # When port 3000 is busy
        "http://localhost:3002",      # When ports 3000-3001 busy
        "http://127.0.0.1:3000",      # IP version of above
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://localhost:8000",      # Self-referential
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],
    expose_headers=["Content-Type", "Authorization"],
    max_age=3600,
)
```

**Key improvements:**

- ✅ Includes all possible localhost variants (3000, 3001, 3002)
- ✅ Includes both localhost and 127.0.0.1 IP versions
- ✅ Explicitly lists all HTTP methods including DELETE and OPTIONS
- ✅ Lists all necessary headers for auth and CORS preflight
- ✅ Exposes Content-Type and Authorization headers
- ✅ Caches preflight requests for 1 hour

### Frontend: [frontend/src/lib/api.ts](frontend/src/lib/api.ts)

**Updated axios Configuration:**

```typescript
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // NEW: Allow credentials across origins
});
```

**Kept proper request/response interceptors:**

- Automatically adds Bearer token to all requests
- Logs when token is found or missing
- Handles 401 errors by redirecting to login
- Logs all API errors for debugging

---

## How It Works Now

### Request Flow

1. **Frontend makes a request** (e.g., DELETE /projects/123)

   ```javascript
   api.delete("/projects/123"); // withCredentials: true
   ```

2. **Browser sends preflight OPTIONS request**

   ```http
   OPTIONS /projects/123
   Origin: http://localhost:3002
   Access-Control-Request-Method: DELETE
   Access-Control-Request-Headers: content-type, authorization
   ```

3. **Backend responds with CORS headers**

   ```http
   Access-Control-Allow-Origin: http://localhost:3002
   Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Authorization, ...
   Access-Control-Allow-Credentials: true
   ```

4. **Browser sees headers match, allows actual request**

   ```http
   DELETE /projects/123
   Authorization: Bearer [token]
   Content-Type: application/json
   Origin: http://localhost:3002
   ```

5. **Backend processes and responds**
   ```http
   204 No Content
   Access-Control-Allow-Origin: http://localhost:3002
   ```

---

## All Allowed Frontend Origins

After this fix, these frontend URLs will work without CORS errors:

| Protocol | Host      | Port | Full URL              |
| -------- | --------- | ---- | --------------------- |
| http     | localhost | 3000 | http://localhost:3000 |
| http     | localhost | 3001 | http://localhost:3001 |
| http     | localhost | 3002 | http://localhost:3002 |
| http     | 127.0.0.1 | 3000 | http://127.0.0.1:3000 |
| http     | 127.0.0.1 | 3001 | http://127.0.0.1:3001 |
| http     | 127.0.0.1 | 3002 | http://127.0.0.1:3002 |

---

## Allowed HTTP Methods

✅ GET - Fetch data
✅ POST - Create new resources
✅ PUT - Replace resources
✅ PATCH - Update resources
✅ DELETE - Remove resources
✅ OPTIONS - Preflight requests

---

## Allowed Headers

✅ Content-Type - For JSON payloads
✅ Authorization - For Bearer tokens
✅ Accept - Request header
✅ Origin - CORS origin
✅ Access-Control-Request-Method - Preflight
✅ Access-Control-Request-Headers - Preflight

---

## What to Do If CORS Still Errors

### 1. **Check Your Frontend URL**

- Look at your browser address bar
- Is it `http://localhost:3000`? ✅ Allowed
- Is it `http://localhost:3002`? ✅ Allowed
- Is it something else? ❌ Add it to backend CORS config

### 2. **Verify Backend is Running**

```bash
curl http://localhost:8000/health
```

Should return: `{"status":"healthy"}`

### 3. **Verify Frontend is Logged In**

Open Browser DevTools Console:

```javascript
localStorage.getItem("token");
```

Should show a token, not `null`

### 4. **Check Network Request Headers**

1. Open DevTools (F12)
2. Go to Network tab
3. Make a request (e.g., try to delete a project)
4. Click on the failed request
5. Check Response Headers for:
   - `access-control-allow-origin: http://localhost:3002`
   - `access-control-allow-credentials: true`

### 5. **Restart Both Servers**

```bash
# Backend
cd backend
python run.py
```

```bash
# Frontend (in new terminal)
cd frontend
npm run dev
```

---

## Testing CORS

### Manual Test with curl

```bash
# Test preflight request
curl -X OPTIONS http://localhost:8000/projects/ \
  -H "Origin: http://localhost:3002" \
  -H "Access-Control-Request-Method: DELETE" \
  -v
```

### Automated Test Script

Run the provided test script:

```bash
cd backend
python test_cors.py
```

This will test all allowed origins and show which CORS headers are being returned.

---

## For Production

When deploying to production, you must:

1. **Change allowed origins** to your actual domain:

```python
allow_origins=[
    "https://yourdomain.com",
    "https://www.yourdomain.com",
    # Remove localhost entries for production
]
```

2. **Use HTTPS everywhere** - CORS requires HTTPS for production

3. **Update frontend environment** in `.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## Files Changed

1. **backend/app/main.py** - Updated CORS configuration
2. **frontend/src/lib/api.ts** - Added `withCredentials`, fixed duplicate export
3. **backend/test_cors.py** - NEW test script for verifying CORS
4. **CORS_TROUBLESHOOTING.md** - NEW comprehensive troubleshooting guide

---

## Summary

The CORS errors are now fixed! The system supports:

✅ Multiple frontend ports (3000, 3001, 3002)
✅ Both localhost and 127.0.0.1 addresses
✅ All necessary HTTP methods and headers
✅ Proper credential handling
✅ Preflight request support

Your requests should now work without CORS errors!
