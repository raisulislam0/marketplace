# Marketplace - Project Workflow System

A full-stack role-based project marketplace workflow system built with **Next.js**, **FastAPI**, and **MongoDB**.

Live Link: https://marketplace-beta-sooty-37.vercel.app/login
Admin: raisul@gmail.com | pass: raisul

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [How It Works - User Guide](#how-it-works---user-guide)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)

---

## 🎯 Overview

This application simulates a real-world marketplace where:

- **Admins** manage users and assign roles
- **Buyers** create projects and review submissions
- **Problem Solvers** browse projects, submit work plans with milestones, and deliver completed work

### Key Capabilities

✅ **Role-Based Access Control** - Three distinct user roles with specific permissions  
✅ **Milestone-Based Workflow** - Solvers submit detailed work plans that buyers approve  
✅ **Progress Tracking** - Real-time tracking of milestone completion  
✅ **File Management** - Upload and download ZIP files for deliverables  
✅ **Search Functionality** - Search for projects and users  
✅ **Project Management** - Full CRUD operations with status tracking

---

## ✨ Features

### Core Features

1. **Authentication & Authorization**
   - JWT-based authentication
   - Secure password hashing with bcrypt
   - Role-based access control (RBAC)
   - Protected routes and API endpoints

2. **User Management**
   - User registration and login
   - Profile management for problem solvers
   - Admin role assignment
   - User search by name or email

3. **Project Lifecycle**
   - Create projects with budget, deadline, and requirements
   - Browse available projects
   - Request to work on projects
   - Milestone-based work plans
   - Status tracking (open → assigned → in_progress → completed)
   - Project search by title or description
   - Project management (update status, deadline, delete)

4. **Milestone System**
   - Solvers submit detailed work plans with milestones
   - Buyers review and approve/reject plans
   - Track progress based on completed milestones
   - Real-time progress percentage calculation

5. **Task Management**
   - Create multiple tasks per project
   - Upload ZIP files for submissions
   - Review and feedback system
   - Accept or reject with comments
   - Revision and resubmission capability

6. **File Handling**
   - Upload ZIP files (problem solvers)
   - Download submitted files (buyers and admins)
   - Secure file storage

7. **Search & Discovery**
   - Search projects by title or description
   - Search users by name or email
   - Role-based filtering

---

## 🏗️ System Architecture

### Role Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                    MARKETPLACE SYSTEM                    │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───▼───┐          ┌────▼────┐       ┌─────▼──────┐
    │ ADMIN │          │  BUYER  │       │  PROBLEM   │
    │       │          │         │       │  SOLVER    │
    └───┬───┘          └────┬────┘       └─────┬──────┘
```

#### 1. Admin

- View all users in the system
- Assign "buyer" role to users
- View and manage all projects
- Search users and projects
- Full system oversight

#### 2. Buyer

- Create new projects
- View incoming work requests and plans
- Approve or reject work plans with feedback
- Assign ONE problem solver per project
- Review task submissions
- Download submitted files
- Accept or reject completed work
- Manage own projects (update status, deadline, delete)

#### 3. Problem Solver

- Create and manage profile (bio, skills, experience)
- Browse available (open) projects
- Request to work on projects
- Submit detailed work plans with milestones
- Track milestone progress
- Create multiple tasks for assigned projects
- Submit work as ZIP files
- Handle rejections and resubmit

### Project Lifecycle

```
1. Admin assigns Buyer role to user
2. Buyer creates project (status: open)
3. Problem solvers request to work on project
4. Problem solver submits detailed work plan with milestones
5. Buyer reviews and approves/reject plan
6. If approved: Project becomes assigned, solver can start work
7. Problem solver completes milestones and creates tasks
8. Problem solver submits ZIP file upon completion
9. Buyer reviews submission
10. Buyer accepts → task marked as completed
    OR Buyer rejects → problem solver can revise
```

---

## 💻 Technology Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend

- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **JWT** - Authentication tokens
- **Python-Jose** - JWT encoding/decoding
- **Passlib** - Password hashing
- **bcrypt** - Password encryption

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.9+
- **MongoDB** (Atlas or local instance)

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Create virtual environment:**

   ```bash
   python -m venv venv

   # Windows:
   venv\Scripts\activate

   # macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**

   ```bash
   # Copy example env file
   cp .env.example .env

   # Edit .env and add your MongoDB connection string
   MONGODB_URL=mongodb+srv://your-connection-string
   DATABASE_NAME=marketplace
   SECRET_KEY=your-super-secret-key-min-32-characters
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   UPLOAD_DIR=uploads
   ```

5. **Create uploads directory:**

   ```bash
   mkdir uploads
   ```

6. **Run the backend:**

   ```bash
   python run.py
   ```

   Backend will be available at `http://localhost:8000`
   API docs at `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**

   ```bash
   # Copy example env file
   cp .env.local.example .env.local

   # Edit .env.local
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the frontend:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Frontend will be available at `http://localhost:3000`

### Create First Admin User

After starting both servers:

1. Register a user at `http://localhost:3000/register`
2. Manually update the user's role to "admin" in MongoDB:
   ```javascript
   // In MongoDB Compass or Atlas
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } },
   );
   ```

---

## 📖 How It Works - User Guide

### For Admins

1. **Login** with admin credentials
2. **View all users** in the Users section
3. **Assign buyer role** to users who need to create projects
4. **View all projects** in the Projects Overview
5. **Manage any project** (change status, deadline, delete)
6. **Search** for users or projects

### For Buyers

1. **Login** with buyer credentials
2. **Create a new project:**
   - Click "Create Project"
   - Fill in title, description, budget, deadline, requirements
   - Submit

3. **Review work requests:**
   - View "Pending Plans" section
   - Click on a plan to see details
   - Review milestones and estimated duration
   - **Approve** to assign solver OR **Reject** with feedback

4. **Track progress:**
   - View assigned projects
   - See milestone completion percentage
   - Monitor solver progress

5. **Review submissions:**
   - View submitted tasks
   - Download ZIP files
   - **Accept** to mark complete OR **Reject** with comments

6. **Manage projects:**
   - Update project status
   - Change deadline
   - Delete projects

7. **Search** for projects or users

### For Problem Solvers

1. **Login** with problem solver credentials

2. **Update your profile:**
   - Click on profile icon
   - Add bio, skills, experience
   - Save changes

3. **Browse available projects:**
   - View "Available Projects" section
   - Search for specific projects
   - Click on a project to see details

4. **Request to work on a project:**
   - Click "Request to Work"
   - **Submit a detailed work plan:**
     - Plan title (e.g., "UI Redesign Implementation")
     - Plan description (your approach and methodology)
     - Estimated duration in days
     - **Add milestones:**
       - Milestone title (e.g., "Wireframes")
       - Description of deliverable
       - Estimated hours
       - Deadline (optional)
     - Add multiple milestones
   - Submit plan

5. **Wait for buyer approval:**
   - Buyer reviews your plan
   - If approved: Project assigned to you
   - If rejected: Read feedback and submit new plan

6. **Complete milestones:**
   - View "My Projects" section
   - See progress tracker
   - Click "Start" on a milestone to begin
   - Click "Complete" when finished
   - Progress percentage updates automatically

7. **Create and submit tasks:**
   - Click "Add Task"
   - Fill in task details
   - Click "Start Working"
   - Upload ZIP file when complete
   - Submit for review

8. **Handle feedback:**
   - If rejected: Read comments
   - Make revisions
   - Resubmit

---

## 📚 API Reference

### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### User Endpoints

- `GET /users/` - Get all users (Admin only)
- `PATCH /users/{user_id}/role` - Assign role (Admin only)
- `GET /users/problem-solvers` - Get all problem solvers
- `PUT /users/profile` - Update profile (Problem Solver)
- `GET /users/search/` - Search users by name or email

### Project Endpoints

- `POST /projects/` - Create project (Buyer)
- `GET /projects/` - Get projects (role-based filtering)
- `GET /projects/{project_id}` - Get specific project
- `PATCH /projects/{project_id}` - Update project (Buyer)
- `DELETE /projects/{project_id}` - Delete project (Admin/Buyer)
- `PATCH /projects/{project_id}/status` - Update status (Admin/Buyer)
- `PATCH /projects/{project_id}/deadline` - Update deadline (Admin/Buyer)
- `GET /projects/search/` - Search projects by title or description

### Request Endpoints

- `POST /requests/` - Request to work on project (Problem Solver)
- `GET /requests/project/{project_id}` - Get project requests (Buyer)
- `PATCH /requests/{request_id}` - Accept/reject request (Buyer)

### Plan Endpoints (Milestone System)

- `POST /plans/` - Create work plan (Problem Solver)
- `GET /plans/request/{request_id}` - Get plans for request
- `PATCH /plans/{plan_id}/approve` - Approve plan (Buyer)
- `PATCH /plans/{plan_id}/reject` - Reject plan with feedback (Buyer)
- `PATCH /plans/milestone/{milestone_id}` - Update milestone status

### Task Endpoints

- `POST /tasks/` - Create task (Problem Solver)
- `GET /tasks/project/{project_id}` - Get project tasks
- `PATCH /tasks/{task_id}` - Update task (Problem Solver)
- `POST /tasks/{task_id}/submit` - Submit task with ZIP file
- `POST /tasks/{task_id}/review` - Review task submission (Buyer)
- `GET /tasks/{task_id}/download` - Download submitted file (Buyer/Admin)

**Full API documentation available at:** `http://localhost:8000/docs`

---

## 🌐 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. **Push code to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create account** on Render, Railway, or Heroku

3. **Create new web service:**
   - Connect GitHub repository
   - Select repository
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Add environment variables:**

   ```
   MONGODB_URL=your-mongodb-atlas-connection-string
   DATABASE_NAME=marketplace
   SECRET_KEY=your-super-secret-key-min-32-characters
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   UPLOAD_DIR=uploads
   ```

5. **Deploy** and note the URL

### Frontend Deployment (Vercel/Netlify)

1. **Create account** on Vercel or Netlify

2. **Import project:**
   - Connect GitHub repository
   - Framework: Next.js
   - Root directory: `frontend`

3. **Add environment variable:**

   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

4. **Deploy**

### MongoDB Atlas Setup

1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for development)
4. Get connection string
5. Update backend environment variables

---

## 🔧 Troubleshooting

### Backend Won't Start

**Issue:** Backend fails to start

**Solutions:**

- Check if MongoDB connection string is correct
- Ensure virtual environment is activated
- Check if port 8000 is available
- Verify all dependencies are installed: `pip install -r requirements.txt`

### Frontend Won't Start

**Issue:** Frontend fails to start

**Solutions:**

- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Check if port 3000 is available
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

### Can't Login

**Issue:** Login fails or returns errors

**Solutions:**

- Check if backend is running at `http://localhost:8000`
- Check browser console for errors
- Verify API URL in `.env.local`
- Clear browser localStorage: `localStorage.clear()`

### CORS Errors

**Issue:** Cross-Origin Resource Sharing errors

**Solutions:**

- Verify frontend URL is in backend CORS allowed origins
- Check `backend/app/main.py` CORS configuration
- Restart both servers
- Ensure `withCredentials: true` in frontend API client

### File Upload Fails

**Issue:** Cannot upload ZIP files

**Solutions:**

- Ensure `uploads` directory exists in backend
- Only ZIP files are allowed
- Check file size limits
- Verify file permissions on uploads directory

### bcrypt/Password Errors

**Issue:** `ValueError: password cannot be longer than 72 bytes`

**Solutions:**

- Stop backend server
- Run: `pip uninstall bcrypt -y && pip install bcrypt==3.2.2`
- Restart backend server
- Password truncation is handled automatically in code

### Database Connection Issues

**Issue:** Cannot connect to MongoDB

**Solutions:**

- Verify MongoDB Atlas connection string
- Check network access/IP whitelist in Atlas
- Ensure database user credentials are correct
- Test connection string in MongoDB Compass

---

## 📁 Project Structure

```
marketplace/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── user.py           # User model with role-based fields
│   │   │   ├── project.py        # Project model with buyer/solver details
│   │   │   ├── request.py        # Work request model
│   │   │   ├── plan.py           # Work plan with milestones
│   │   │   └── task.py           # Task submission model
│   │   ├── routers/
│   │   │   ├── auth.py           # Authentication endpoints
│   │   │   ├── users.py          # User management + search
│   │   │   ├── projects.py       # Project CRUD + search
│   │   │   ├── requests.py       # Work requests
│   │   │   ├── plans.py          # Milestone plans
│   │   │   └── tasks.py          # Task submission + file handling
│   │   ├── utils/
│   │   │   ├── auth.py           # JWT + password hashing
│   │   │   └── dependencies.py   # Auth dependencies
│   │   ├── config.py             # Configuration settings
│   │   ├── database.py           # MongoDB connection
│   │   └── main.py               # FastAPI app + CORS
│   ├── uploads/                  # File storage directory
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Environment variables
│   └── run.py                    # Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── login/            # Login page
│   │   │   ├── register/         # Registration page
│   │   │   └── dashboard/        # Main dashboard
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.tsx    # Navigation bar
│   │   │   │   └── SearchBar.tsx # Reusable search component
│   │   │   ├── dashboards/
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── BuyerDashboard.tsx
│   │   │   │   └── ProblemSolverDashboard.tsx
│   │   │   ├── modals/
│   │   │   │   ├── CreateProjectModal.tsx
│   │   │   │   ├── PlanSubmissionModal.tsx
│   │   │   │   ├── PlanReviewModal.tsx
│   │   │   │   ├── TaskSubmissionModal.tsx
│   │   │   │   ├── TaskReviewModal.tsx
│   │   │   │   └── ProjectDetailsModal.tsx
│   │   │   └── lists/
│   │   │       ├── ProjectsList.tsx
│   │   │       ├── RequestsList.tsx
│   │   │       └── TasksList.tsx
│   │   ├── lib/
│   │   │   └── api.ts            # Axios API client
│   │   ├── store/
│   │   │   ├── authStore.ts      # Auth state management
│   │   │   └── toastStore.ts     # Toast notifications
│   │   └── types/
│   │       └── index.ts          # TypeScript interfaces
│   ├── public/                   # Static assets
│   ├── .env.local                # Environment variables
│   ├── package.json              # Node dependencies
│   ├── tailwind.config.ts        # Tailwind configuration
│   └── tsconfig.json             # TypeScript configuration
│
└── README.md                     # This file
```

---

## 🔒 Security Features

- **Password Hashing**: bcrypt with automatic 72-byte truncation
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access Control**: Endpoint-level permission checks
- **Protected Routes**: Frontend route guards based on user role
- **Input Validation**: Pydantic models for all API inputs
- **CORS Configuration**: Controlled cross-origin access
- **File Type Validation**: Only ZIP files allowed for uploads
- **MongoDB Injection Protection**: Parameterized queries via Motor

---

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for transitions
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Modal Dialogs**: Clean, accessible modal components
- **Progress Tracking**: Visual milestone completion indicators
- **Search Functionality**: Real-time search with debouncing
- **Role-Based UI**: Different dashboards for each user type

---

## 🏗️ Key Architectural Decisions

### Why Milestone-Based Workflow?

Traditional freelance platforms often lack transparency in work progress. The milestone system:

- Provides clear deliverables and timelines
- Allows buyers to approve work plans before assignment
- Enables real-time progress tracking
- Reduces disputes through structured planning

### Why MongoDB?

- **Flexible Schema**: Easy to add new fields (e.g., buyer_email, solver_name)
- **Document Model**: Natural fit for nested data (milestones within plans)
- **Async Support**: Motor driver for high-performance async operations
- **Scalability**: Horizontal scaling for future growth

### Why FastAPI?

- **Modern Python**: Native async/await support
- **Auto Documentation**: Interactive API docs at `/docs`
- **Type Safety**: Pydantic models for validation
- **Performance**: Comparable to Node.js and Go
- **Developer Experience**: Clean, intuitive syntax

### Why Next.js?

- **Server-Side Rendering**: Better SEO and initial load times
- **App Router**: Modern routing with layouts
- **TypeScript**: Type safety across the stack
- **Developer Experience**: Hot reload, fast refresh
- **Deployment**: Seamless Vercel integration

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Support

For questions or issues, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using Next.js, FastAPI, and MongoDB**
