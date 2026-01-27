# Integration Notes: Milestone-Based Workflow Implementation

## Summary of Changes

### Backend Changes

#### 1. New File: `backend/app/routers/plans.py`

- Complete router with 5 endpoints
- Handles plan CRUD, approval/rejection, milestone updates
- Automatic progress calculation on milestone updates
- Full authorization checks (solver, buyer, admin roles)

**Endpoints Added**:

- `POST /plans/` - Create plan (problem_solver only)
- `GET /plans/request/{request_id}` - List plans for request
- `PATCH /plans/{plan_id}/approve` - Approve plan (buyer only)
- `PATCH /plans/{plan_id}/reject` - Reject with reason (buyer only)
- `PATCH /plans/milestone/{milestone_id}` - Update milestone status

#### 2. Modified: `backend/app/models/plan.py`

- Added new models: `Plan`, `PlanCreate`, `PlanUpdate`, `Milestone`, `MilestoneUpdate`
- Models have proper Pydantic config with `by_alias = False` for correct JSON serialization
- All models properly handle ObjectId conversion to string for `id` field

#### 3. Modified: `backend/app/main.py`

- Added import: `from app.routers import plans`
- Added router registration: `app.include_router(plans.router)`
- CORS config already supports all needed origins and methods

### Frontend Changes

#### 1. New Component: `src/components/modals/PlanSubmissionModal.tsx`

- Modal for solvers to submit work plans with milestones
- Features:
  - Plan title, description, estimated days input
  - Dynamic milestone management (add/remove)
  - Form validation
  - API integration with POST /plans/
  - Success/error handling with toast notifications

**Props**:

- `isOpen: boolean` - Control visibility
- `onClose: () => void` - Close handler
- `project: Project` - Project being requested
- `requestId: string` - Request ID (from POST /requests/)
- `onSuccess: () => void` - Success callback

#### 2. New Component: `src/components/modals/PlanApprovalModal.tsx`

- Modal for buyers to review and approve/reject plans
- Features:
  - Display plan details and all milestones
  - Approve button (PATCH /plans/{id}/approve)
  - Reject with feedback (PATCH /plans/{id}/reject)
  - Clear UX showing rejection form on demand

**Props**:

- `isOpen: boolean`
- `onClose: () => void`
- `plan: Plan` - Plan to review
- `solverName: string` - Name of solver who submitted
- `onSuccess: () => void` - Callback after action

#### 3. New Component: `src/components/ProgressTracker.tsx`

- Display milestone progress and allow status updates
- Features:
  - Progress bar (0-100%)
  - Completed/total milestones counter
  - List of milestones with status badges
  - Action buttons (Start/Complete) for solvers
  - Milestone metadata (hours, deadline)

**Props**:

- `milestones: Milestone[]` - Array of milestone objects
- `progressPercentage: number` - 0-100 progress value
- `showControls?: boolean` - Show action buttons
- `onMilestoneUpdate?: (id, status) => Promise<void>` - Update callback

#### 4. Modified: `src/components/dashboards/ProblemSolverDashboard.tsx`

- Added import: `PlanSubmissionModal`
- Added state:
  - `showPlanSubmissionModal: boolean`
  - `currentRequestId: string | null`
- Modified `handleRequestProject()`:
  - After POST /requests/ succeeds, shows PlanSubmissionModal
  - Stores request ID for plan submission
  - User must submit plan before request is fully complete

#### 5. Modified: `src/components/dashboards/BuyerDashboard.tsx`

- Added import: `PlanApprovalModal`
- Added state:
  - `showPlanApprovalModal: boolean`
  - `selectedPlan: Plan | null`
  - `pendingPlans: Plan[]`
  - `selectedSolverName: string`
- Added PlanApprovalModal to modals section
- Ready for future enhancement: Pending plans display

### Type System

- Plan and Milestone types should be added to `src/types/index.ts`
- Suggested types:

```typescript
export interface Plan {
  id: string;
  request_id: string;
  solver_id: string;
  title: string;
  description: string;
  estimated_days: number;
  milestones: Milestone[];
  status: "pending" | "approved" | "rejected" | "completed";
  progress_percentage: number;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  plan_id: string;
  title: string;
  description: string;
  estimated_hours: number;
  deadline?: string;
  status: "pending" | "in_progress" | "completed" | "rejected";
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

---

## Data Flow

### Creating a Plan

```
1. ProblemSolverDashboard handleRequestProject()
   ↓
2. POST /requests/ → Creates request, returns request ID
   ↓
3. PlanSubmissionModal shows (with request ID)
   ↓
4. Solver fills form with plan + milestones
   ↓
5. POST /plans/ {request_id, title, description, milestones[]}
   ↓
6. Backend validates, creates plan with status="pending"
   ↓
7. Frontend shows success, closes modal
```

### Approving a Plan

```
1. BuyerDashboard shows pending plans
   ↓
2. Buyer clicks plan → PlanApprovalModal shows
   ↓
3. Buyer clicks "Approve"
   ↓
4. PATCH /plans/{id}/approve
   ↓
5. Backend:
   - Updates plan: status="approved", approved_at, approved_by
   - Updates request: status="accepted"
   - Updates project: assigned_solver_id, status="assigned"
   ↓
6. Frontend shows success, refreshes data
```

### Tracking Progress

```
1. Solver on assigned project sees ProgressTracker
   ↓
2. Clicks "Start" on milestone 1
   ↓
3. PATCH /plans/milestone/{id} {status: "in_progress"}
   ↓
4. Backend updates milestone, recalculates progress (0%)
   ↓
5. Solver completes work, clicks "Complete"
   ↓
6. PATCH /plans/milestone/{id} {status: "completed"}
   ↓
7. Backend updates milestone, recalculates progress (33%)
   ↓
8. Both dashboards show updated progress in real-time (on refresh)
```

---

## Integration Checklist

### Backend Setup

- [x] Created `backend/app/routers/plans.py`
- [x] Updated `backend/app/main.py` to include plans router
- [x] Verified `backend/app/models/plan.py` exists with all models
- [x] CORS configured for all needed endpoints
- [x] No syntax errors in plans.py

### Frontend Setup

- [x] Created `PlanSubmissionModal.tsx`
- [x] Created `PlanApprovalModal.tsx`
- [x] Created `ProgressTracker.tsx`
- [x] Updated `ProblemSolverDashboard.tsx` with modal integration
- [x] Updated `BuyerDashboard.tsx` with approval modal

### Type Definitions

- [ ] Add Plan interface to `src/types/index.ts`
- [ ] Add Milestone interface to `src/types/index.ts`

### Database Setup

- [ ] MongoDB should auto-create `plans` collection
- [ ] MongoDB should auto-create `milestones` collection
- [ ] No migrations needed (using MongoDB auto-schema)

### Testing

- [ ] Test: Solver requests project
- [ ] Test: PlanSubmissionModal opens
- [ ] Test: Submit plan with milestones
- [ ] Test: Buyer approves plan
- [ ] Test: Project assigned to solver
- [ ] Test: Solver updates milestone status
- [ ] Test: Progress updates correctly
- [ ] Test: Reject plan and resubmit
- [ ] Test: Authorization (solver can't approve, buyer can't create plan, etc.)

---

## API Contract

### Request Objects

```typescript
// POST /plans/
{
  request_id: string;
  title: string;
  description: string;
  estimated_days: number;
  milestones: Array<{
    title: string;
    description: string;
    estimated_hours: number;
    deadline?: string;  // ISO datetime
  }>;
}

// PATCH /plans/{plan_id}/reject
{
  reason: string;  // Rejection feedback
}

// PATCH /plans/milestone/{milestone_id}
{
  status?: "pending" | "in_progress" | "completed" | "rejected";
  notes?: string;
  completed_at?: string;  // ISO datetime
}
```

### Response Objects

```typescript
// POST /plans/ (201 Created)
// PATCH /plans/{id}/approve (200 OK)
// PATCH /plans/{id}/reject (200 OK)
{
  id: string;
  request_id: string;
  solver_id: string;
  title: string;
  description: string;
  estimated_days: number;
  milestones: Milestone[];
  status: string;
  progress_percentage: number;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

// GET /plans/request/{request_id} (200 OK)
[
  { ...plan object... },
  { ...plan object... }
]

// PATCH /plans/milestone/{id} (200 OK)
{
  id: string;
  plan_id: string;
  title: string;
  description: string;
  estimated_hours: number;
  deadline?: string;
  status: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

### Error Responses

```typescript
// 400 Bad Request
{
  detail: "Invalid request ID";
}

// 403 Forbidden
{
  detail: "Not authorized";
}

// 404 Not Found
{
  detail: "Request not found";
}

// 500 Server Error
{
  detail: "Internal server error";
}
```

---

## Known Limitations & Future Work

### Current Implementation

- ✓ Plan submission with milestones
- ✓ Buyer approval/rejection
- ✓ Progress tracking by milestone completion
- ✓ Role-based authorization
- ✓ Full workflow from request to completion

### Not Yet Implemented

- Notifications (buyer should be notified when plan submitted)
- Attachments (solvers can't attach files to milestones)
- Comments (no discussion on plans)
- Partial acceptance (buyer must approve/reject whole plan)
- Milestone rollback (once completed, can't change)

### Performance Optimizations (Future)

- Cache progress calculation
- Index queries on request_id and plan_id
- Batch milestone updates
- Real-time WebSocket updates instead of polling

---

## Debugging Tips

### Plan not created?

1. Check POST /plans/ response in browser DevTools
2. Verify request_id is valid and matches created request
3. Check auth token is present
4. Look for validation errors in response.data.detail

### Plan not appearing in buyer view?

1. Refresh browser
2. Check GET /plans/request/{request_id} returns plans
3. Verify user is the project buyer
4. Check plan status is "pending" (not "approved")

### Progress not updating?

1. After PATCH /plans/milestone/{id}, refresh page
2. Verify milestone status changed to "in_progress" or "completed"
3. Check plan's progress_percentage field updated
4. Confirm all milestones have status set

### Authorization errors?

1. Check Authorization header has valid JWT
2. Verify user role matches required role for endpoint
3. Check you own the resource (request, plan, project)
4. Try with admin account to test

---

## File Locations

**Backend**:

- `backend/app/routers/plans.py` (NEW)
- `backend/app/models/plan.py` (EXISTS)
- `backend/app/main.py` (MODIFIED)

**Frontend**:

- `frontend/src/components/modals/PlanSubmissionModal.tsx` (NEW)
- `frontend/src/components/modals/PlanApprovalModal.tsx` (NEW)
- `frontend/src/components/ProgressTracker.tsx` (NEW)
- `frontend/src/components/dashboards/ProblemSolverDashboard.tsx` (MODIFIED)
- `frontend/src/components/dashboards/BuyerDashboard.tsx` (MODIFIED)
- `frontend/src/types/index.ts` (TO MODIFY - add Plan, Milestone)

---

## Support & Maintenance

For questions about:

- **Backend API**: Check `backend/app/routers/plans.py` docstrings
- **Frontend UI**: Check component prop definitions
- **Data Models**: Check `backend/app/models/plan.py`
- **Workflow Logic**: See `MILESTONE_SYSTEM_IMPLEMENTATION.md`
