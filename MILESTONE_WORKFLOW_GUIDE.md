# Milestone-Based Project Request Workflow - Quick Start Guide

## What Was Implemented

A complete project request workflow where **problem solvers** submit detailed work plans with milestones that **buyers** must approve before work begins. Progress is tracked based on completed milestones.

---

## The Complete Workflow

### Step 1: Solver Requests to Work (Existing)

```
Solver Dashboard → Browse Projects → Click "Request to Work"
```

### Step 2: Solver Submits Plan (NEW ✨)

```
PlanSubmissionModal Opens Automatically ↓
Solver fills in:
  - Plan Title (e.g., "UI Redesign Implementation")
  - Plan Description (approach and methodology)
  - Estimated Duration (days)
  - Milestones:
    - Milestone 1: Wireframes (10 hours, deadline: Jan 15)
    - Milestone 2: Design Mockups (15 hours, deadline: Jan 22)
    - Milestone 3: Development (30 hours, deadline: Feb 5)
```

**Click "Submit Plan"** → Request now has an associated plan waiting for buyer approval

### Step 3: Buyer Reviews Plan (NEW ✨)

```
Buyer Dashboard → Pending Plans Section
  → Click on plan → PlanApprovalModal Opens
  → Shows:
     - Plan title and description
     - All milestones with details
     - Total estimated duration

Buyer can:
  ✓ "Approve Plan" → Project assigned to solver, work begins
  ✗ "Reject Plan" → Request feedback form, solver can resubmit
```

### Step 4: Solver Completes Milestones (NEW ✨)

```
After plan approval:
  Solver goes to "My Projects" section
  → Sees ProgressTracker showing:
     - 0% progress (no milestones started)
     - All milestones listed

Solver clicks "Start" on Milestone 1:
  → Status becomes "in_progress"
  → Milestone shows progress icon

Solver clicks "Complete" when done:
  → Status becomes "completed"
  → Progress updates: 1/3 = 33%
  → Can now start next milestone
```

### Step 5: Buyer Tracks Progress (NEW ✨)

```
Buyer Dashboard → "In Progress Projects"
  → Assigned Projects show ProgressTracker

Real-time visibility:
  - See each milestone status
  - Track overall completion %
  - Verify quality before milestone marked complete (optional)

When all 3 milestones done → Progress = 100%
```

---

## New Components Created

### Backend: `/plans` Router

**Endpoints**:

- `POST /plans/` - Solver submits a plan
- `GET /plans/request/{request_id}` - Get plans for a request
- `PATCH /plans/{plan_id}/approve` - Buyer approves
- `PATCH /plans/{plan_id}/reject` - Buyer rejects with feedback
- `PATCH /plans/milestone/{milestone_id}` - Update milestone status

### Frontend: PlanSubmissionModal

**When**: Opens automatically after request creation
**Features**:

- Form to enter plan details
- Add/remove milestones dynamically
- Full validation
- Success/error handling

### Frontend: PlanApprovalModal

**When**: Buyer clicks pending plan in dashboard
**Features**:

- Display full plan and milestones
- Approve button (assigns project to solver)
- Reject button (with feedback form)
- Clean review interface

### Frontend: ProgressTracker

**When**: Displayed on assigned projects
**Features**:

- Visual progress bar (0-100%)
- Milestone list with status
- Action buttons (Start/Complete)
- Estimated hours and deadlines
- Real-time progress calculation

---

## Database Schema Changes

### New Collections

**plans**

```
{
  _id: ObjectId,
  request_id: "...",        // Reference to request
  solver_id: "...",         // Who created this plan
  title: "...",
  description: "...",
  estimated_days: 14,
  milestones: [             // Embedded array
    { title, description, estimated_hours, deadline }
  ],
  status: "pending|approved|rejected|completed",
  progress_percentage: 0-100,
  approved_at: timestamp,
  approved_by: "...",       // Buyer who approved
  rejection_reason: "...",  // If rejected
  created_at: timestamp,
  updated_at: timestamp
}
```

**milestones**

```
{
  _id: ObjectId,
  plan_id: "...",
  title: "...",
  description: "...",
  estimated_hours: 20,
  deadline: timestamp,
  status: "pending|in_progress|completed|rejected",
  completed_at: timestamp,
  notes: "...",
  created_at: timestamp,
  updated_at: timestamp
}
```

---

## Key Features & Benefits

### For Problem Solvers

✓ Clear requirements in request form
✓ Can break down work into manageable pieces
✓ Buyer approves plan before starting (no surprises)
✓ Track progress as milestones complete
✓ If rejected, get feedback and can resubmit

### For Buyers

✓ See detailed work plan before committing
✓ Approve/reject plans with constructive feedback
✓ Real-time progress tracking
✓ Verify quality at each milestone boundary
✓ Transparency from start to completion

### For System

✓ Structured project workflow
✓ Measurable progress (milestones vs estimates)
✓ Dispute resolution data (if issues arise)
✓ Quality checkpoints built-in
✓ Complete audit trail

---

## Authorization & Security

**Who can create plans?**

- Only `problem_solver` role
- Only for requests they created
- Only for open projects

**Who can approve plans?**

- Only `buyer` role
- Only for their own projects
- Automatically assigns solver to project

**Who can reject plans?**

- Only `buyer` role
- Must provide feedback
- Solver can resubmit new plan

**Who can update milestones?**

- `problem_solver` - update their own plan's milestones
- `buyer` - can review progress
- `admin` - full access

---

## Testing the Workflow

### Test Case 1: Complete Successful Flow

1. Create a test project as buyer
2. Request to work on it as solver
3. Submit plan with 3 milestones
4. Approve as buyer ✓
5. Complete each milestone ✓
6. Verify progress reaches 100% ✓

### Test Case 2: Rejection & Resubmission

1. Submit plan
2. Reject with feedback as buyer
3. Plan status → "rejected"
4. Solver submits new plan
5. Approve second plan ✓

### Test Case 3: Partial Progress

1. Approve plan
2. Complete 1 of 3 milestones
3. Progress should show 33%
4. Verify buyer can see 33% in their dashboard

### Test Case 4: Authorization

1. As solver, try to approve a plan (should fail 403)
2. As buyer, try to approve someone else's project plan (should fail 403)
3. As admin, should be able to access all (should succeed)

---

## API Usage Examples

### Submit a Plan

```bash
POST /plans/
{
  "request_id": "660a1b2c3d4e5f6g7h8i9j0k",
  "title": "Complete Website Redesign",
  "description": "Full redesign including...",
  "estimated_days": 21,
  "milestones": [
    {
      "title": "Wireframes",
      "description": "Create wireframes for all pages",
      "estimated_hours": 16,
      "deadline": "2024-01-15T00:00:00Z"
    },
    {
      "title": "Design",
      "description": "Create high-fidelity mockups",
      "estimated_hours": 20,
      "deadline": "2024-01-22T00:00:00Z"
    }
  ]
}

Response: 201 Created
{
  "id": "new_plan_id",
  "status": "pending",
  "progress_percentage": 0.0,
  ...
}
```

### Approve a Plan

```bash
PATCH /plans/660a1b2c3d4e5f6g7h8i9j0k/approve
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "...",
  "status": "approved",
  "approved_at": "2024-01-10T12:00:00Z",
  "approved_by": "buyer_user_id"
}
```

### Update Milestone Status

```bash
PATCH /plans/milestone/660a1b2c3d4e5f6g7h8i9j0k
{
  "status": "in_progress"
}

Response: 200 OK
Plan's progress_percentage auto-updates
```

---

## Performance Considerations

**Progress Calculation**

- Runs only when milestone status changes
- Efficient: counts completed milestones, divides by total
- Stored in `progress_percentage` field (no recalc on read)

**Queries**

- Plans fetched by request_id (indexed)
- Milestones fetched by plan_id (indexed)
- No N+1 queries (milestones embedded in plan)

**Real-time Updates**

- Frontend polls or shows last fetched state
- No WebSocket implementation (use if real-time critical)

---

## Future Enhancements

1. **Notifications**
   - Notify buyer when plan submitted
   - Notify solver when plan approved/rejected
   - Notify buyer when milestone completed

2. **Attachments**
   - Solvers attach work samples to milestones
   - Buyers attach review feedback
   - Files stored with completion

3. **Messaging**
   - Comments on plans
   - Discussion on milestones
   - Async communication thread

4. **Time Tracking**
   - Actual hours vs estimated
   - Variance reporting
   - Solver reliability metrics

5. **Analytics**
   - Plan approval rate
   - Average completion time vs estimate
   - Solver performance dashboard
   - Buyer feedback analysis

6. **Templates**
   - Save plan templates
   - Reuse milestones across projects
   - Faster submission

---

## Troubleshooting

**Plan not appearing after submission?**

- Check browser DevTools Network tab
- Verify POST /plans/ returns 201
- Confirm request_id matches

**Milestone not updating?**

- Ensure solver is owner of plan
- Check PATCH /plans/milestone/{id} response
- Refresh page to see updated progress

**Authorization errors (403)?**

- Verify user role (solver, buyer, admin)
- Confirm you own the project/request
- Check auth token is valid

**Progress not calculating?**

- After updating milestone, progress_percentage should auto-update
- Refresh dashboard to see new percentage
- Check all milestones are valid (title, description, hours)

---

## Summary

This implementation provides a **complete, transparent workflow** for project requests:

- **Before**: Solvers just request, buyers approve blindly
- **After**: Solvers submit detailed plans, buyers review milestones, progress is tracked systematically

The system encourages **clear communication** and **measurable progress** while maintaining flexibility through plan rejection and resubmission.
