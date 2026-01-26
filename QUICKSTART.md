# Quick Start Guide

This guide will help you get the Marketplace application up and running in minutes.

## Prerequisites

Make sure you have:
- Node.js 18+ installed
- Python 3.9+ installed
- MongoDB connection string (MongoDB Atlas recommended)

## Step 1: Clone and Setup

```bash
# If you haven't cloned yet
git clone <your-repo-url>
cd marketplace
```

## Step 2: Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env  # Windows
# OR
cp .env.example .env    # macOS/Linux

# Edit .env and add your MongoDB connection string
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/
# SECRET_KEY=your-super-secret-key-min-32-characters

# Create uploads directory
mkdir uploads

# Run the backend
python run.py
```

Backend should now be running at `http://localhost:8000`
Visit `http://localhost:8000/docs` to see the API documentation.

## Step 3: Frontend Setup (5 minutes)

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install
# OR
yarn install

# Create .env.local file
copy .env.local.example .env.local  # Windows
# OR
cp .env.local.example .env.local    # macOS/Linux

# The default should work:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Run the frontend
npm run dev
# OR
yarn dev
```

Frontend should now be running at `http://localhost:3000`

## Step 4: Test the Application

### Create Users

1. **Register First User (Admin)**
   - Go to `http://localhost:3000/register`
   - Create an account (will be problem_solver by default)
   - After registration, manually update this user's role to "admin" in MongoDB:
     ```javascript
     // In MongoDB Compass or Atlas
     db.users.updateOne(
       { email: "your-email@example.com" },
       { $set: { role: "admin" } }
     )
     ```

2. **Register Second User (Buyer)**
   - Register another account
   - Login as admin
   - Assign "buyer" role to this user

3. **Register Third User (Problem Solver)**
   - Register another account (stays as problem_solver)

### Test the Workflow

1. **As Admin:**
   - Login with admin credentials
   - View all users
   - Assign buyer role to a user

2. **As Buyer:**
   - Login with buyer credentials
   - Create a new project
   - Fill in project details
   - Wait for problem solver requests

3. **As Problem Solver:**
   - Login with problem solver credentials
   - Update your profile
   - Browse available projects
   - Click "Request to Work" on a project

4. **Back to Buyer:**
   - View incoming requests
   - Accept a request
   - Project status changes to "assigned"

5. **Back to Problem Solver:**
   - View "My Projects"
   - Click "Add Task"
   - Create multiple tasks
   - Click "Start Working" on a task
   - Upload a ZIP file to submit

6. **Back to Buyer:**
   - View submitted tasks
   - Click on submitted task
   - Accept or reject with comments

## Common Issues

### Backend won't start
- Check if MongoDB connection string is correct
- Ensure virtual environment is activated
- Check if port 8000 is available

### Frontend won't start
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Check if port 3000 is available

### Can't login
- Check if backend is running
- Check browser console for errors
- Verify API URL in `.env.local`

### File upload fails
- Ensure `uploads` directory exists in backend
- Only ZIP files are allowed
- Check file size limits

## Next Steps

- Explore the API documentation at `http://localhost:8000/docs`
- Check the main README.md for deployment instructions
- Customize the UI colors and branding
- Add more features as needed

## Support

For issues or questions, please check:
- README.md for detailed documentation
- API docs at `/docs` endpoint
- Backend logs in terminal
- Browser console for frontend errors

