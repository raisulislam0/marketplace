# Deployment Guide

This guide covers deploying the Marketplace application to production.

## Prerequisites

- GitHub account
- MongoDB Atlas account (or MongoDB instance)
- Vercel account (for frontend)
- Render/Railway account (for backend)

## MongoDB Setup

1. **Create MongoDB Atlas Cluster** (if not already done)
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create a database user
   - Whitelist IP addresses (0.0.0.0/0 for development)
   - Get connection string

2. **Connection String Format:**
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority
   ```

## Backend Deployment (Render)

### Option 1: Render

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Render Account**
   - Go to [Render](https://render.com)
   - Sign up with GitHub

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

4. **Configure Service**
   - Name: `marketplace-backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Root Directory: `backend`

5. **Add Environment Variables**
   ```
   MONGODB_URL=your-mongodb-connection-string
   DATABASE_NAME=marketplace
   SECRET_KEY=your-super-secret-key-min-32-characters
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   UPLOAD_DIR=uploads
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Note the URL (e.g., `https://marketplace-backend.onrender.com`)

### Option 2: Railway

1. **Create Railway Account**
   - Go to [Railway](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository

3. **Configure**
   - Add environment variables (same as above)
   - Railway auto-detects Python
   - Add start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Deploy**
   - Railway automatically deploys
   - Note the URL

## Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to [Vercel](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

4. **Add Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   ```
   Replace with your actual backend URL from Render/Railway

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment
   - Note the URL (e.g., `https://marketplace.vercel.app`)

## Post-Deployment Setup

### 1. Update CORS Settings

Update `backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-frontend-url.vercel.app"  # Add your Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Create Admin User

SSH into your backend server or use the seed script:

```bash
# If using Render, use their shell
# If using Railway, use their CLI

python backend/seed_admin.py
```

Or manually in MongoDB Atlas:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### 3. Test the Deployment

1. Visit your frontend URL
2. Register a new user
3. Login and test functionality
4. Check browser console for errors
5. Check backend logs for issues

## Environment Variables Summary

### Backend (.env)
```
MONGODB_URL=mongodb+srv://...
DATABASE_NAME=marketplace
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=uploads
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## Continuous Deployment

Both Vercel and Render/Railway support automatic deployments:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **Auto-Deploy**
   - Vercel automatically deploys frontend
   - Render/Railway automatically deploys backend

## Monitoring

### Backend Logs
- **Render**: Dashboard → Logs tab
- **Railway**: Project → Deployments → Logs

### Frontend Logs
- **Vercel**: Project → Deployments → Function Logs

## Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- Check environment variables
- Check MongoDB connection string
- Review build logs

**Problem**: CORS errors
- Update `allow_origins` in main.py
- Redeploy backend

### Frontend Issues

**Problem**: Can't connect to backend
- Check `NEXT_PUBLIC_API_URL`
- Ensure backend is running
- Check browser console

**Problem**: Build fails
- Check Node version (18+)
- Clear cache and rebuild
- Check for TypeScript errors

## Custom Domain (Optional)

### Frontend (Vercel)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Backend (Render)
1. Go to Settings → Custom Domain
2. Add your custom domain
3. Update DNS records

## Security Checklist

- [ ] Change SECRET_KEY to a strong random string
- [ ] Use environment variables for all secrets
- [ ] Enable MongoDB authentication
- [ ] Whitelist specific IPs in MongoDB (not 0.0.0.0/0)
- [ ] Use HTTPS for all connections
- [ ] Set up rate limiting
- [ ] Enable logging and monitoring
- [ ] Regular security updates

## Backup Strategy

1. **MongoDB Backups**
   - MongoDB Atlas provides automatic backups
   - Configure backup schedule in Atlas

2. **Code Backups**
   - GitHub serves as code backup
   - Tag releases for version control

## Scaling Considerations

- **Backend**: Render/Railway auto-scales
- **Frontend**: Vercel auto-scales
- **Database**: MongoDB Atlas supports scaling
- **File Storage**: Consider AWS S3 for uploads

## Cost Estimates

- **MongoDB Atlas**: Free tier (512MB)
- **Render**: Free tier (limited hours)
- **Railway**: $5/month credit
- **Vercel**: Free tier (generous limits)

**Total**: $0-10/month for small projects

