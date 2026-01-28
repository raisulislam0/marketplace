# MongoDB SSL/TLS Connection Fix for Render Deployment

## Problem
Your backend deployed on Render was experiencing SSL handshake errors when connecting to MongoDB Atlas:
```
pymongo.errors.ServerSelectionTimeoutError: SSL handshake failed
[SSL: TLSV1_ALERT_INTERNAL_ERROR] tlsv1 alert internal error
```

## Solution Applied

### 1. Updated MongoDB Connection Configuration
**File: `backend/app/database.py`**
- Added `certifi` package for SSL certificate verification
- Configured MongoDB client with proper TLS/SSL settings:
  - `tlsCAFile=certifi.where()` - Uses certifi's CA bundle for SSL verification
  - `serverSelectionTimeoutMS=5000` - 5 second timeout
  - `connectTimeoutMS=10000` - 10 second connection timeout
  - `socketTimeoutMS=20000` - 20 second socket timeout

### 2. Updated Dependencies
**File: `backend/requirements.txt`**
- Added `certifi==2024.8.30` package

### 3. Updated Seed Script
**File: `backend/seed_admin.py`**
- Applied same SSL/TLS configuration for consistency

### 4. Updated CORS Settings
**File: `backend/app/main.py`**
- Added production frontend URL to allowed origins
- Added placeholder for Vercel/Netlify deployment

## Deployment Steps

### Step 1: Commit and Push Changes
```bash
git add .
git commit -m "Fix MongoDB SSL/TLS connection for Render deployment"
git push origin backend
```

### Step 2: Render Will Auto-Deploy
Render will automatically detect the changes and redeploy your backend service.

### Step 3: Verify Deployment
1. Check Render logs to ensure no SSL errors
2. Look for: `Connected to MongoDB database: marketplace`
3. Test the `/health` endpoint: `https://marketplace-f9x1.onrender.com/health`

### Step 4: Test from Frontend
Try logging in from your local frontend using the Render backend URL.

## Additional Recommendations

### 1. MongoDB Atlas Network Access
Ensure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0) or specifically from Render's IP addresses.

**Steps:**
1. Go to MongoDB Atlas Dashboard
2. Navigate to Network Access
3. Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
4. Or add Render's specific IP ranges

### 2. Update Frontend CORS Origin
When you deploy your frontend to Vercel/Netlify, update the CORS origins in `backend/app/main.py`:
```python
allow_origins=[
    # ... existing origins ...
    "https://your-frontend-domain.vercel.app",  # Add your actual frontend URL
]
```

### 3. Environment Variables on Render
Verify these environment variables are set on Render:
- `MONGODB_URL` - Your MongoDB Atlas connection string
- `DATABASE_NAME` - marketplace
- `SECRET_KEY` - A secure secret key (min 32 characters)
- `ALGORITHM` - HS256
- `ACCESS_TOKEN_EXPIRE_MINUTES` - 30
- `UPLOAD_DIR` - uploads

### 4. Test Locally First (Optional)
If you want to test the SSL fix locally:
```bash
cd backend
pip install -r requirements.txt
python run.py
```

## What Changed

### Before:
```python
client = AsyncIOMotorClient(settings.mongodb_url)
```

### After:
```python
client = AsyncIOMotorClient(
    settings.mongodb_url,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=10000,
    socketTimeoutMS=20000,
)
```

## Why This Fixes the Issue

1. **certifi Package**: Provides Mozilla's CA bundle, which is trusted by MongoDB Atlas
2. **tlsCAFile**: Explicitly tells PyMongo where to find SSL certificates
3. **Timeout Settings**: Prevents hanging connections and provides better error messages
4. **Platform Compatibility**: Works across different platforms (Render, Railway, Heroku, etc.)

## Troubleshooting

If you still see errors after deployment:

1. **Check MongoDB Atlas IP Whitelist**
   - Ensure 0.0.0.0/0 is allowed or add Render's IPs

2. **Verify Connection String**
   - Ensure the MongoDB URL in Render environment variables is correct
   - Should start with `mongodb+srv://`

3. **Check Render Logs**
   - Look for any other error messages
   - Verify the app is using Python 3.11

4. **Test MongoDB Connection**
   - Use MongoDB Compass to test the connection string
   - Ensure the database user has proper permissions

## Next Steps

1. Push the changes to GitHub
2. Wait for Render to auto-deploy
3. Check Render logs for successful MongoDB connection
4. Test login from your local frontend
5. Deploy frontend to Vercel/Netlify
6. Update CORS origins with production frontend URL

