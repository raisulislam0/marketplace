# System Understanding & Flow Decomposition

## Role Hierarchy

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
        │                   │                   │
        │                   │                   │
```

### Admin Capabilities
- View all users in the system
- Assign "buyer" role to users
- View all projects (read-only)
- No direct project execution

### Buyer Capabilities
- Create new projects
- View incoming work requests
- Accept/reject problem solver requests
- Assign ONE problem solver per project
- Review task submissions
- Accept or reject completed work

### Problem Solver Capabilities
- Create and manage profile (bio, skills, experience)
- Browse available (open) projects
- Request to work on projects
- Create multiple tasks/sub-modules for assigned projects
- Manage task metadata (title, description, timeline)
- Submit work as ZIP files
- Revise and resubmit rejected work

## Project Lifecycle States

```
┌──────────┐
│   OPEN   │ ◄─── Buyer creates project
└────┬─────┘
     │
     │ Problem solvers send requests
     │
     ▼
┌──────────────┐
│   ASSIGNED   │ ◄─── Buyer accepts one request
└────┬─────────┘
     │
     │ Problem solver creates tasks
     │
     ▼
┌──────────────┐
│ IN_PROGRESS  │ ◄─── Tasks being worked on
└────┬─────────┘
     │
     │ All tasks completed
     │
     ▼
┌──────────────┐
│  COMPLETED   │ ◄─── All tasks accepted
└──────────────┘
```

## Task Lifecycle States

```
┌──────────┐
│ PENDING  │ ◄─── Problem solver creates task
└────┬─────┘
     │
     │ Problem solver starts work
     │
     ▼
┌──────────────┐
│ IN_PROGRESS  │ ◄─── Task being worked on
└────┬─────────┘
     │
     │ Problem solver uploads ZIP
     │
     ▼
┌──────────────┐
│  SUBMITTED   │ ◄─── Waiting for buyer review
└────┬─────────┘
     │
     ├─────────────┬─────────────┐
     │             │             │
     ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│COMPLETED │  │ REJECTED │  │ PENDING  │
│          │  │          │  │ (retry)  │
└──────────┘  └────┬─────┘  └──────────┘
                   │
                   │ Problem solver revises
                   │
                   ▼
              ┌──────────────┐
              │ IN_PROGRESS  │
              └──────────────┘
```

## Complete Workflow

### Step 1: User Registration & Role Assignment
```
1. User registers → Default role: "problem_solver"
2. Admin logs in
3. Admin assigns "buyer" role to specific users
```

### Step 2: Project Creation (Buyer)
```
1. Buyer logs in
2. Clicks "Create Project"
3. Fills in:
   - Title
   - Description
   - Budget (optional)
   - Deadline (optional)
   - Requirements (tags)
4. Project created with status: "open"
```

### Step 3: Request to Work (Problem Solver)
```
1. Problem solver logs in
2. Views "Available Projects" (status: open)
3. Clicks "Request to Work" on a project
4. Optional: Adds message
5. Request created with status: "pending"
```

### Step 4: Request Review (Buyer)
```
1. Buyer views project
2. Sees list of pending requests
3. Reviews problem solver profiles
4. Accepts ONE request
5. System automatically:
   - Updates project status to "assigned"
   - Sets assigned_solver_id
   - Rejects all other pending requests
```

### Step 5: Task Creation (Problem Solver)
```
1. Problem solver views "My Projects"
2. Clicks "Add Task"
3. Creates task with:
   - Title
   - Description
   - Deadline (optional)
   - Metadata (custom fields)
4. Task created with status: "pending"
5. Repeats for multiple sub-modules
```

### Step 6: Task Execution (Problem Solver)
```
1. Problem solver clicks "Start Working"
2. Task status → "in_progress"
3. Works on the task
4. Prepares deliverable as ZIP file
5. Uploads ZIP file
6. Task status → "submitted"
```

### Step 7: Task Review (Buyer)
```
1. Buyer views project tasks
2. Sees tasks with status: "submitted"
3. Reviews submission
4. Option A: Accept
   - Task status → "completed"
   - Optional: Add positive feedback
5. Option B: Reject
   - Task status → "rejected"
   - Required: Add rejection reason
   - Problem solver can revise and resubmit
```

### Step 8: Project Completion
```
1. All tasks marked as "completed"
2. Project status → "completed"
3. Workflow ends
```

## Data Flow

### Authentication Flow
```
Client → POST /auth/register → Backend → MongoDB
Client → POST /auth/login → Backend → JWT Token → Client
Client → GET /auth/me (with JWT) → Backend → User Data
```

### Project Flow
```
Buyer → POST /projects/ → Backend → MongoDB → Project Created
Solver → GET /projects/ → Backend → Filter by status → Open Projects
Admin → GET /projects/ → Backend → All Projects
```

### Request Flow
```
Solver → POST /requests/ → Backend → Validate → MongoDB
Buyer → GET /requests/project/{id} → Backend → Requests List
Buyer → PATCH /requests/{id} → Backend → Update + Auto-reject others
```

### Task Flow
```
Solver → POST /tasks/ → Backend → Validate ownership → MongoDB
Solver → PATCH /tasks/{id} → Backend → Update status
Solver → POST /tasks/{id}/submit + ZIP → Backend → Save file → Update
Buyer → POST /tasks/{id}/review → Backend → Update status
```

## State Transitions

### Project State Machine
```
OPEN → (accept request) → ASSIGNED
ASSIGNED → (tasks created) → IN_PROGRESS
IN_PROGRESS → (all tasks done) → COMPLETED
ANY → (buyer cancels) → CANCELLED
```

### Task State Machine
```
PENDING → (start work) → IN_PROGRESS
IN_PROGRESS → (submit file) → SUBMITTED
SUBMITTED → (buyer accepts) → COMPLETED
SUBMITTED → (buyer rejects) → REJECTED
REJECTED → (revise) → IN_PROGRESS
```

## Security & Authorization

### Endpoint Protection
- `/auth/*` - Public
- `/users/` - Admin only
- `/users/{id}/role` - Admin only
- `/projects/` (POST) - Buyer only
- `/projects/` (GET) - Role-based filtering
- `/requests/` (POST) - Problem Solver only
- `/requests/project/{id}` - Buyer (owner) only
- `/tasks/` (POST) - Problem Solver (assigned) only
- `/tasks/{id}/review` - Buyer (owner) only

### Data Isolation
- Buyers see only their projects
- Problem Solvers see open projects + their assigned projects
- Admins see everything
- Tasks visible only to project owner and assigned solver

