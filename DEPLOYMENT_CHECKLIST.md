# Deployment Checklist

## ✅ Changes Made

- [x] Updated `backend/app/database.py` with SSL/TLS configuration
- [x] Added `certifi==2024.8.30` to `backend/requirements.txt`
- [x] Updated `backend/seed_admin.py` with SSL/TLS configuration
- [x] Updated CORS settings in `backend/app/main.py`

## 📋 Deployment Steps

### 1. Commit and Push Changes
```bash
git add backend/app/database.py backend/requirements.txt backend/seed_admin.py backend/app/main.py
git commit -m "Fix MongoDB SSL/TLS connection for Render deployment"
git push origin backend
```

### 2. MongoDB Atlas Configuration
- [ ] Go to [MongoDB Atlas](https://cloud.mongodb.com/)
- [ ] Click on "Network Access" in the left sidebar
- [ ] Click "Add IP Address"
- [ ] Select "Allow Access from Anywhere" (0.0.0.0/0)
- [ ] Click "Confirm"

### 3. Verify Render Deployment
- [ ] Go to your [Render Dashboard](https://dashboard.render.com/)
- [ ] Open your backend service
- [ ] Wait for auto-deployment to complete
- [ ] Check the logs for: `Connected to MongoDB database: marketplace`
- [ ] Verify no SSL errors appear

### 4. Test Backend Health
- [ ] Open: https://marketplace-f9x1.onrender.com/health
- [ ] Should return: `{"status": "healthy"}`

### 5. Test from Local Frontend
- [ ] Ensure `frontend/.env.local` has: `NEXT_PUBLIC_API_URL=https://marketplace-f9x1.onrender.com`
- [ ] Start your local frontend: `cd frontend && npm run dev`
- [ ] Try to login with test credentials
- [ ] Check browser console for any errors

### 6. Frontend Deployment (When Ready)
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Get the production frontend URL
- [ ] Update `backend/app/main.py` CORS origins with the frontend URL
- [ ] Commit and push the CORS update
- [ ] Test login from production frontend

## 🔍 Troubleshooting

### If MongoDB Connection Still Fails:

1. **Check MongoDB Atlas IP Whitelist**
   ```
   MongoDB Atlas → Network Access → Add IP Address → 0.0.0.0/0
   ```

2. **Verify Environment Variables on Render**
   - MONGODB_URL (should start with mongodb+srv://)
   - DATABASE_NAME (should be "marketplace")
   - SECRET_KEY (min 32 characters)

3. **Check Render Logs**
   ```
   Render Dashboard → Your Service → Logs
   ```
   Look for:
   - ✅ "Connected to MongoDB database: marketplace"
   - ❌ Any SSL or connection errors

4. **Test MongoDB Connection String**
   - Copy the MONGODB_URL from Render environment variables
   - Test it in MongoDB Compass
   - Ensure it connects successfully

### If CORS Errors Occur:

1. **Check Browser Console**
   - Look for CORS-related errors
   - Note the origin that's being blocked

2. **Update CORS Origins**
   - Add the blocked origin to `backend/app/main.py`
   - Commit and push changes

## 📝 Notes

- Render auto-deploys when you push to the connected branch
- The SSL fix uses `certifi` package for certificate verification
- MongoDB Atlas must allow connections from Render's IPs
- CORS must include your frontend URL (both local and production)

## 🎯 Expected Results

After successful deployment:
- ✅ Backend connects to MongoDB without SSL errors
- ✅ Health endpoint returns `{"status": "healthy"}`
- ✅ Login works from local frontend
- ✅ No CORS errors in browser console
- ✅ API requests complete successfully

## 🚀 Next Steps After Successful Deployment

1. Create admin user (if not already created)
2. Test all API endpoints
3. Deploy frontend to production
4. Update CORS with production frontend URL
5. Test end-to-end workflow

