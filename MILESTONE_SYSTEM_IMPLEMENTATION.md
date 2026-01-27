# Project Request Workflow with Milestone-Based Progress Tracking

## Overview

Implemented a complete workflow for project requests where:

1. **Problem Solver** submits a detailed work plan with milestones when requesting a project
2. **Buyer** reviews the plan and can approve or reject it with feedback
3. **System** tracks progress based on completed milestones
4. **Both parties** can see real-time progress and project status

---

## Backend Implementation

### 1. Models (app/models/plan.py)

Created two new models for the plan/milestone system:

**Plan Model**

- `id`: Unique identifier (MongoDB \_id)
- `request_id`: Reference to the work request
- `solver_id`: ID of the problem solver submitting the plan
- `title`: Plan title (e.g., "UI Design Implementation")
- `description`: Detailed plan description
- `estimated_days`: Total estimated duration
- `milestones`: List of milestone objects
- `status`: "pending" | "approved" | "rejected" | "completed"
- `progress_percentage`: Auto-calculated based on completed milestones (0-100)
- `approved_at`: Timestamp when plan was approved
- `approved_by`: User ID of approving buyer
- `rejection_reason`: Reason if plan was rejected
- `created_at`, `updated_at`: Timestamps

**Milestone Model**

- `id`: Unique identifier
- `plan_id`: Reference to parent plan
- `title`: Milestone title (e.g., "Wireframe Design")
- `description`: What will be delivered
- `estimated_hours`: Time estimate
- `deadline`: Optional deadline date
- `status`: "pending" | "in_progress" | "completed" | "rejected"
- `completed_at`: When milestone was completed
- `notes`: Optional notes on completion
- `created_at`, `updated_at`: Timestamps

### 2. Router (app/routers/plans.py)

**POST /plans/** - Create a plan

- Only problem_solver role
- Validates that request exists and belongs to the solver
- Creates plan with pending status
- Returns created plan with ID

**GET /plans/request/{request_id}** - Get plans for a request

- Returns list of all plans for a request
- Access: solver who created request, project buyer, admin
- Filters by request_id

**PATCH /plans/{plan_id}/approve** - Buyer approves plan

- Only buyer role
- Verifies buyer owns the project
- Sets plan status to "approved"
- Updates request status to "accepted"
- **Assigns solver to project** (updates assigned_solver_id, status = "assigned")
- Records approval timestamp and approver

**PATCH /plans/{plan_id}/reject** - Buyer rejects plan

- Only buyer role
- Requires rejection reason in request body
- Sets plan status to "rejected"
- Records rejection reason
- Solver can submit new plan

**PATCH /plans/milestone/{milestone_id}** - Update milestone status

- Problem solver or buyer can update
- Solver can mark milestones as pending → in_progress → completed
- Automatically recalculates plan progress percentage
- Updates `progress_percentage` on parent plan

**Helper Function: recalculate_plan_progress()**

- Counts completed milestones
- Calculates: `(completed / total) * 100`
- Updates plan's progress_percentage field

### 3. Integration with main.py

- Added plans router import: `from app.routers import plans`
- Registered plans router: `app.include_router(plans.router)`

---

## Frontend Implementation

### 1. PlanSubmissionModal Component

**File**: `src/components/modals/PlanSubmissionModal.tsx`

**Props**:

- `isOpen`: Boolean to control visibility
- `onClose`: Callback to close modal
- `project`: Project object being requested
- `requestId`: ID of the created request
- `onSuccess`: Callback when plan submitted successfully

**Features**:

- Plan title and description input
- Estimated duration (days)
- **Dynamic milestone management**:
  - Add/remove milestones
  - Each milestone has: title, description, estimated hours, deadline
  - Validation: all fields required, at least 1 milestone
- Submits to POST `/plans/` endpoint
- Shows success message and refreshes data on completion

**Flow**:

1. Solver clicks "Request to Work" on a project
2. First, POST /requests/ is called (creates request)
3. Then PlanSubmissionModal opens automatically
4. Solver fills in plan and milestones
5. Clicks "Submit Plan"
6. Plan is created with status = "pending"
7. Buyer sees it in their dashboard

### 2. PlanApprovalModal Component

**File**: `src/components/modals/PlanApprovalModal.tsx`

**Props**:

- `isOpen`: Boolean
- `onClose`: Callback
- `plan`: Plan object to review
- `solverName`: Name of the solver who submitted the plan
- `onSuccess`: Callback when plan is approved/rejected

**Features**:

- **Displays plan details**:
  - Title, description
  - Estimated duration
  - Number of milestones
  - List of all milestones with:
    - Title, description
    - Estimated hours
    - Deadline (if set)
- **Two action paths**:
  - "Approve Plan":
    - Calls PATCH `/plans/{plan_id}/approve`
    - Assigns project to solver
    - Shows success message
  - "Reject Plan":
    - Shows rejection reason form
    - Requires feedback for solver
    - Calls PATCH `/plans/{plan_id}/reject`
    - Solver can resubmit new plan

### 3. ProgressTracker Component

**File**: `src/components/ProgressTracker.tsx`

**Props**:

- `milestones`: Array of milestone objects
- `progressPercentage`: 0-100 progress value
- `showControls`: Boolean to show milestone action buttons
- `onMilestoneUpdate`: Optional callback when milestone status changes

**Features**:

- **Progress bar** showing visual percentage
- **Stats**: "X of Y milestones completed"
- **Milestone list** showing:
  - Icon indicating status (pending/in_progress/completed/rejected)
  - Milestone title and description
  - Estimated hours and deadline
  - Completion date if completed
- **Action buttons** (when showControls=true):
  - Pending → "Start" button (mark in_progress)
  - In Progress → "Complete" button (mark completed)
  - Completed/Rejected → Status badge

**Used by**:

- ProblemSolverDashboard (to show progress on assigned projects)
- BuyerDashboard (to review milestone completion)

### 4. ProblemSolverDashboard Updates

**File**: `src/components/dashboards/ProblemSolverDashboard.tsx`

**Changes**:

- Imported `PlanSubmissionModal`
- Added state for `showPlanSubmissionModal` and `currentRequestId`
- Updated `handleRequestProject()`:
  - After POST /requests/ succeeds, stores the request ID
  - Opens PlanSubmissionModal instead of just showing a success message
  - User must submit a plan before the request can be reviewed by buyer

**New Flow**:

```
Problem Solver Dashboard
  → Click "Request to Work"
  → ProjectDetailsModal closes
  → PlanSubmissionModal opens
  → Fill in plan details + milestones
  → Click "Submit Plan"
  → Buyer can now approve/reject
```

### 5. BuyerDashboard Updates

**File**: `src/components/dashboards/BuyerDashboard.tsx`

**Changes**:

- Imported `PlanApprovalModal`
- Added state for `showPlanApprovalModal`, `selectedPlan`, `pendingPlans`, `selectedSolverName`
- Added PlanApprovalModal to modals section

**Enhancements needed**:

- Add section to display "Pending Plans for Review"
- When buyer clicks a pending plan, PlanApprovalModal opens
- After approval, project appears in "In Progress" section
- Can now use ProgressTracker to show milestone progress

---

## Workflow Summary

### Phase 1: Request Creation (Existing Flow)

1. Problem Solver sees available projects
2. Clicks "Request to Work on This Project"
3. POST /requests/ is called
4. Request created with status = "pending"

### Phase 2: Plan Submission (NEW)

1. PlanSubmissionModal automatically opens
2. Solver fills in:
   - Plan title and description
   - Estimated duration
   - Milestones (with details for each)
3. Clicks "Submit Plan"
4. POST /plans/ creates plan with status = "pending"
5. Request is now awaiting buyer review

### Phase 3: Plan Review (NEW)

1. Buyer sees notification of pending plan
2. Opens PlanApprovalModal
3. Reviews plan details and milestones
4. Can:
   - **Approve**:
     - Plan status → "approved"
     - Request status → "accepted"
     - Project assigned to solver
     - Solver added to project team
   - **Reject**:
     - Plan status → "rejected"
     - Solver receives feedback
     - Solver can submit new plan
     - Request remains pending

### Phase 4: Milestone Progress (NEW)

1. Solver assigned to project
2. Solver sees ProgressTracker showing:
   - All milestones
   - Current progress percentage
   - Action buttons
3. As solver completes milestones:
   - Clicks "Start" to mark in_progress
   - Clicks "Complete" when done
   - PATCH /plans/milestone/{id} updates status
   - Progress percentage auto-calculates
4. Buyer can see:
   - Same ProgressTracker
   - Real-time completion percentage
   - Which milestones are done

### Phase 5: Project Completion

1. When all milestones completed
2. Progress = 100%
3. Plan status can be updated to "completed"
4. Project workflow finishes

---

## Database Collections

### requests collection

```json
{
  "_id": "ObjectId",
  "project_id": "project_id",
  "solver_id": "solver_id",
  "message": "Message text",
  "status": "pending|accepted|rejected",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### plans collection (NEW)

```json
{
  "_id": "ObjectId",
  "request_id": "request_id",
  "solver_id": "solver_id",
  "title": "Plan Title",
  "description": "Plan Description",
  "estimated_days": 14,
  "milestones": [
    {
      "title": "Milestone 1",
      "description": "Description",
      "estimated_hours": 20,
      "deadline": "timestamp"
    }
  ],
  "status": "pending|approved|rejected|completed",
  "progress_percentage": 0.0,
  "approved_at": "timestamp",
  "approved_by": "user_id",
  "rejection_reason": "Reason text",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### milestones collection (NEW)

```json
{
  "_id": "ObjectId",
  "plan_id": "plan_id",
  "title": "Milestone Title",
  "description": "What will be delivered",
  "estimated_hours": 20,
  "deadline": "timestamp",
  "status": "pending|in_progress|completed|rejected",
  "completed_at": "timestamp",
  "notes": "Completion notes",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

---

## Key Features

✅ **Complete Request Workflow**

- Request creation
- Plan submission with detailed milestones
- Buyer review and approval/rejection
- Automatic project assignment on approval

✅ **Milestone-Based Progress Tracking**

- Auto-calculated progress percentage
- Real-time milestone status updates
- Progress visible to both solver and buyer

✅ **User Experience**

- Modal-driven workflow (no page navigation needed)
- Clear feedback and validation
- Rejection with constructive feedback
- Ability to resubmit plans if rejected

✅ **Role-Based Access Control**

- Solver: Can only create plans for their own requests
- Buyer: Can approve/reject and view progress
- Admin: Full access to all projects

---

## Testing Checklist

- [ ] Problem solver can request to work on a project
- [ ] PlanSubmissionModal opens automatically after request creation
- [ ] Solver can add multiple milestones to a plan
- [ ] Plan validation works (requires title, description, milestones)
- [ ] Milestone validation works (requires title, description, hours)
- [ ] Plan is sent to backend and saved
- [ ] Buyer can see pending plans
- [ ] Buyer can approve plan (project becomes assigned)
- [ ] Buyer can reject plan with reason
- [ ] Solver can see ProgressTracker on assigned project
- [ ] Solver can start milestone (pending → in_progress)
- [ ] Solver can complete milestone (in_progress → completed)
- [ ] Progress percentage updates in real-time
- [ ] Progress = 100% when all milestones completed
- [ ] Buyer can see same progress on their side

---

## Next Steps

1. **Test the workflow end-to-end**
   - Create a test project
   - Submit request as solver
   - Submit plan with milestones
   - Approve as buyer
   - Update milestones and track progress

2. **Add notifications** (future enhancement)
   - Notify buyer when plan submitted
   - Notify solver when plan approved/rejected
   - Notify buyer when milestone completed

3. **Add analytics** (future enhancement)
   - Plan success rate
   - Average completion time vs estimate
   - Solver reliability metrics

4. **Add attachments** (future enhancement)
   - Solvers can attach files to milestones
   - Buyers can attach review feedback
