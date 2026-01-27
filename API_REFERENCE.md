# API Reference: Plans & Milestone Endpoints

## Base URL

```
http://localhost:8000
```

## Authentication

All endpoints require Bearer token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Create Plan (POST /plans/)

**Role Required**: `problem_solver`

**Description**: Solver submits a work plan with milestones for a project request

**Request**:

```bash
curl -X POST http://localhost:8000/plans/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "660a1b2c3d4e5f6g7h8i9j0k",
    "title": "Complete Website Redesign",
    "description": "Full redesign of website including homepage, product pages, and checkout flow. Will use React for frontend and improve performance.",
    "estimated_days": 21,
    "milestones": [
      {
        "title": "Homepage Redesign",
        "description": "Create new homepage layout with hero section and feature cards",
        "estimated_hours": 16,
        "deadline": "2024-01-15T00:00:00Z"
      },
      {
        "title": "Product Pages",
        "description": "Redesign all product detail pages with new layout",
        "estimated_hours": 20,
        "deadline": "2024-01-22T00:00:00Z"
      },
      {
        "title": "Checkout Flow",
        "description": "Update checkout process with new design and validation",
        "estimated_hours": 24,
        "deadline": "2024-02-05T00:00:00Z"
      }
    ]
  }'
```

**Response** (201 Created):

```json
{
  "id": "660a2d4e5f6g7h8i9j0k1l2m",
  "request_id": "660a1b2c3d4e5f6g7h8i9j0k",
  "solver_id": "solver_user_id",
  "title": "Complete Website Redesign",
  "description": "Full redesign of website...",
  "estimated_days": 21,
  "milestones": [
    {
      "title": "Homepage Redesign",
      "description": "Create new homepage layout...",
      "estimated_hours": 16,
      "deadline": "2024-01-15T00:00:00Z"
    },
    {
      "title": "Product Pages",
      "description": "Redesign all product detail pages...",
      "estimated_hours": 20,
      "deadline": "2024-01-22T00:00:00Z"
    },
    {
      "title": "Checkout Flow",
      "description": "Update checkout process...",
      "estimated_hours": 24,
      "deadline": "2024-02-05T00:00:00Z"
    }
  ],
  "status": "pending",
  "progress_percentage": 0.0,
  "approved_at": null,
  "approved_by": null,
  "rejection_reason": null,
  "created_at": "2024-01-10T10:30:00Z",
  "updated_at": "2024-01-10T10:30:00Z"
}
```

**Errors**:

- `400` - Invalid request ID or missing required fields
- `403` - Not authorized (not problem_solver role)
- `404` - Request not found

---

### 2. Get Plans for Request (GET /plans/request/{request_id})

**Role Required**: `buyer`, `problem_solver`, or `admin`

**Description**: Retrieve all plans submitted for a specific request

**Request**:

```bash
curl -X GET "http://localhost:8000/plans/request/660a1b2c3d4e5f6g7h8i9j0k" \
  -H "Authorization: Bearer <token>"
```

**Response** (200 OK):

```json
[
  {
    "id": "660a2d4e5f6g7h8i9j0k1l2m",
    "request_id": "660a1b2c3d4e5f6g7h8i9j0k",
    "solver_id": "solver_1",
    "title": "Complete Website Redesign",
    "description": "Full redesign of website...",
    "estimated_days": 21,
    "milestones": [...],
    "status": "pending",
    "progress_percentage": 0.0,
    "created_at": "2024-01-10T10:30:00Z",
    "updated_at": "2024-01-10T10:30:00Z"
  },
  {
    "id": "660a3e5f6g7h8i9j0k1l2m3n",
    "request_id": "660a1b2c3d4e5f6g7h8i9j0k",
    "solver_id": "solver_2",
    "title": "Quick Website Update",
    "description": "Update website with new branding...",
    "estimated_days": 7,
    "milestones": [...],
    "status": "pending",
    "progress_percentage": 0.0,
    "created_at": "2024-01-11T14:20:00Z",
    "updated_at": "2024-01-11T14:20:00Z"
  }
]
```

**Errors**:

- `400` - Invalid request ID format
- `403` - Not authorized (must be involved in request or admin)
- `404` - Request not found

---

### 3. Approve Plan (PATCH /plans/{plan_id}/approve)

**Role Required**: `buyer`

**Description**: Buyer approves a plan, which assigns the project to the solver

**Request**:

```bash
curl -X PATCH "http://localhost:8000/plans/660a2d4e5f6g7h8i9j0k1l2m/approve" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Response** (200 OK):

```json
{
  "id": "660a2d4e5f6g7h8i9j0k1l2m",
  "request_id": "660a1b2c3d4e5f6g7h8i9j0k",
  "solver_id": "solver_user_id",
  "title": "Complete Website Redesign",
  "description": "Full redesign of website...",
  "estimated_days": 21,
  "milestones": [...],
  "status": "approved",
  "progress_percentage": 0.0,
  "approved_at": "2024-01-12T09:15:00Z",
  "approved_by": "buyer_user_id",
  "rejection_reason": null,
  "created_at": "2024-01-10T10:30:00Z",
  "updated_at": "2024-01-12T09:15:00Z"
}
```

**Side Effects**:

- Updates request status to `accepted`
- Assigns solver to project (project.assigned_solver_id = solver_id)
- Updates project status to `assigned`

**Errors**:

- `400` - Invalid plan ID
- `403` - Not authorized (not project buyer)
- `404` - Plan or project not found

---

### 4. Reject Plan (PATCH /plans/{plan_id}/reject)

**Role Required**: `buyer`

**Description**: Buyer rejects a plan with feedback. Solver can submit a new plan.

**Request**:

```bash
curl -X PATCH "http://localhost:8000/plans/660a2d4e5f6g7h8i9j0k1l2m/reject" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "The milestone breakdown seems too granular. Can you consolidate into fewer, larger milestones? Also, 21 days seems long - can you estimate 14 days instead?"
  }'
```

**Response** (200 OK):

```json
{
  "id": "660a2d4e5f6g7h8i9j0k1l2m",
  "request_id": "660a1b2c3d4e5f6g7h8i9j0k",
  "solver_id": "solver_user_id",
  "title": "Complete Website Redesign",
  "description": "Full redesign of website...",
  "estimated_days": 21,
  "milestones": [...],
  "status": "rejected",
  "progress_percentage": 0.0,
  "approved_at": null,
  "approved_by": null,
  "rejection_reason": "The milestone breakdown seems too granular...",
  "created_at": "2024-01-10T10:30:00Z",
  "updated_at": "2024-01-12T10:45:00Z"
}
```

**Side Effects**:

- Request remains in `pending` status
- Solver can submit a new plan
- Previous plan marked as `rejected` with reason

**Errors**:

- `400` - Invalid plan ID or missing reason
- `403` - Not authorized (not project buyer)
- `404` - Plan not found

---

### 5. Update Milestone Status (PATCH /plans/milestone/{milestone_id})

**Role Required**: `problem_solver` (owner) or `buyer`

**Description**: Update milestone status and auto-calculate plan progress

**Request** (Start Work):

```bash
curl -X PATCH "http://localhost:8000/plans/milestone/660a4f5g6h7i8j9k0l1m2n3o" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

**Request** (Complete Work):

```bash
curl -X PATCH "http://localhost:8000/plans/milestone/660a4f5g6h7i8j9k0l1m2n3o" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "notes": "Completed ahead of schedule. Used React hooks for better performance."
  }'
```

**Response** (200 OK):

```json
{
  "id": "660a4f5g6h7i8j9k0l1m2n3o",
  "plan_id": "660a2d4e5f6g7h8i9j0k1l2m",
  "title": "Homepage Redesign",
  "description": "Create new homepage layout with hero section and feature cards",
  "estimated_hours": 16,
  "deadline": "2024-01-15T00:00:00Z",
  "status": "completed",
  "completed_at": "2024-01-14T16:30:00Z",
  "notes": "Completed ahead of schedule. Used React hooks for better performance.",
  "created_at": "2024-01-10T10:30:00Z",
  "updated_at": "2024-01-14T16:30:00Z"
}
```

**Note**: After this request, the plan's `progress_percentage` is automatically recalculated:

- Plan had 3 milestones total
- 1 milestone now completed
- Progress = (1/3) × 100 = 33%

**Errors**:

- `400` - Invalid milestone ID
- `403` - Not authorized (not milestone owner or buyer)
- `404` - Milestone or plan not found

**Status Transitions**:

- `pending` → `in_progress` (mark as started)
- `in_progress` → `completed` (mark as done)
- `pending` → `rejected` (buyer rejects milestone)
- Any status → `in_progress` (restart if needed)

---

## Status Reference

### Plan Statuses

| Status      | Meaning                          | Next Action                        |
| ----------- | -------------------------------- | ---------------------------------- |
| `pending`   | Awaiting buyer approval          | Buyer reviews and approves/rejects |
| `approved`  | Buyer approved, work in progress | Solver updates milestone statuses  |
| `rejected`  | Buyer rejected with feedback     | Solver submits new plan            |
| `completed` | All milestones completed         | Project workflow finished          |

### Milestone Statuses

| Status        | Meaning           | Next Action                        |
| ------------- | ----------------- | ---------------------------------- |
| `pending`     | Not started       | Solver clicks "Start"              |
| `in_progress` | Work is happening | Solver clicks "Complete" when done |
| `completed`   | Work finished     | Move to next milestone             |
| `rejected`    | Buyer rejected    | Solver can fix and resubmit        |

### Request Statuses

| Status     | Meaning                                          |
| ---------- | ------------------------------------------------ |
| `pending`  | Solver submitted request, awaiting plan/approval |
| `accepted` | Buyer approved plan, project assigned            |
| `rejected` | Buyer rejected request (old flow)                |

---

## Common Workflows

### Workflow 1: Submit Plan

```
1. POST /requests/
   → request_id = "xxx"

2. POST /plans/
   → plan_id = "yyy", status = "pending"

3. Buyer gets notified
   → Opens dashboard, sees "Pending Plans"
```

### Workflow 2: Approve and Start

```
1. PATCH /plans/yyy/approve
   → status = "approved"
   → project.assigned_solver_id = solver_id
   → request.status = "accepted"

2. Solver assigned to project
   → Sees ProgressTracker

3. PATCH /plans/milestone/m1
   → status = "in_progress"

4. PATCH /plans/milestone/m1
   → status = "completed"
   → plan.progress_percentage = 33%
```

### Workflow 3: Reject and Resubmit

```
1. PATCH /plans/yyy/reject
   → status = "rejected"
   → rejection_reason = "Needs revision"

2. Solver sees rejection
   → Reads feedback
   → Creates new plan

3. POST /plans/
   → New plan submitted
   → Back to approval step
```

---

## Error Handling

### Common Error Responses

**400 Bad Request**

```json
{
  "detail": "Invalid request ID"
}
```

**403 Forbidden**

```json
{
  "detail": "Not authorized"
}
```

**404 Not Found**

```json
{
  "detail": "Plan not found"
}
```

---

## Rate Limiting & Quotas

No rate limiting currently implemented. For production, recommend:

- 100 requests/minute per user
- 1000 requests/minute per API key
- Burst allowance of 20 requests

---

## Response Times

Expected response times (milliseconds):

- `POST /plans/` - 50-100ms (creates plan + milestones)
- `GET /plans/request/` - 20-50ms (queries database)
- `PATCH /plans/{id}/approve` - 50-150ms (updates multiple docs)
- `PATCH /plans/milestone/` - 30-80ms (updates + recalculates)

---

## Code Examples

### Python (using requests)

```python
import requests

BASE_URL = "http://localhost:8000"
HEADERS = {"Authorization": f"Bearer {token}"}

# Create plan
response = requests.post(
    f"{BASE_URL}/plans/",
    headers=HEADERS,
    json={
        "request_id": "xxx",
        "title": "Website Redesign",
        "description": "Complete redesign...",
        "estimated_days": 21,
        "milestones": [
            {
                "title": "Phase 1",
                "description": "Initial design",
                "estimated_hours": 20
            }
        ]
    }
)
plan = response.json()
print(f"Plan created: {plan['id']}")
```

### JavaScript (using fetch)

```javascript
const token = localStorage.getItem("token");
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

// Approve plan
const response = await fetch(`http://localhost:8000/plans/${planId}/approve`, {
  method: "PATCH",
  headers: headers,
});
const approvedPlan = await response.json();
console.log(`Plan approved: ${approvedPlan.status}`);
```

### cURL

```bash
# Get plans for request
curl -X GET "http://localhost:8000/plans/request/req_id" \
  -H "Authorization: Bearer $TOKEN"

# Update milestone
curl -X PATCH "http://localhost:8000/plans/milestone/m_id" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

---

## Documentation Links

- Full implementation: [MILESTONE_SYSTEM_IMPLEMENTATION.md](MILESTONE_SYSTEM_IMPLEMENTATION.md)
- User guide: [MILESTONE_WORKFLOW_GUIDE.md](MILESTONE_WORKFLOW_GUIDE.md)
- Integration guide: [INTEGRATION_NOTES.md](INTEGRATION_NOTES.md)
- Implementation summary: [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)

---

**Last Updated**: January 2024
**Version**: 1.0
**Status**: Production Ready
