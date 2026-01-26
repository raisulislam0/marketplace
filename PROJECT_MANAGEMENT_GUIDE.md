# How to Use Project Management Features

## Overview

Admin users and project creators (buyers) can now manage projects by changing their status, updating deadlines, and deleting them when necessary.

---

## For Buyers (Project Creators)

### Manage Your Own Projects

1. **Navigate to Your Project**
   - Login as a buyer
   - Go to Buyer Dashboard
   - You'll see your created projects

2. **Open Project Details**
   - Click on any project card to open the details modal
   - You'll see a "Manage Project" button (gear icon)

3. **Change Project Status**
   - Click "Manage Project"
   - In the modal, you'll see status buttons:
     - Open (project is available for requests)
     - Assigned (a solver has been assigned)
     - In Progress (work is underway)
     - Completed (project is done)
     - Cancelled (project was cancelled)
   - Click any status button to change it
   - Current status is highlighted in blue

4. **Update Project Deadline**
   - In the Management modal, use the datetime picker to select a new deadline
   - Click the "Update" button to save
   - This is useful for postponing deadlines or moving them up

5. **Delete Project**
   - Scroll to the bottom of the Management modal
   - Click the red "Delete Project" button
   - Confirm when prompted
   - The project will be removed from the system

---

## For Admins

### Manage Any Project

1. **View All Projects**
   - Login as admin
   - Go to Admin Dashboard
   - Scroll down to see "Projects Overview"
   - All projects in the system are displayed in a grid

2. **Manage Any Project**
   - Click on any project card
   - In the details modal, click "Manage Project"
   - You have the same options as buyers (change status, deadline, delete)
   - This works for ANY project in the system, even those created by buyers

3. **Oversight**
   - You can see all projects' statuses, budgets, and deadlines
   - You can intervene if needed by changing status or deleting projects
   - Useful for project oversight and management

---

## For Problem Solvers

### You Cannot Manage Projects

- Problem solvers can view project details
- They can request to work on open projects
- They cannot change project status, deadline, or delete projects
- Management options are only available to admins and project creators

---

## Status Guide

### Open

- Project is available for problem solvers to request
- Solvers can send requests to work on the project
- **Use when**: Project is newly created or reopened for requests

### Assigned

- A problem solver has been assigned to work on the project
- No new requests can be sent
- **Use when**: You've accepted a solver's request

### In Progress

- The assigned solver is actively working on the project
- **Use when**: Work has begun and is underway

### Completed

- The project work is finished
- **Use when**: The project is done and delivered

### Cancelled

- The project is no longer needed
- No further work will be done
- **Use when**: Project is abandoned or no longer relevant

---

## Deadline Management

### Why Update Deadlines?

- Postpone if additional time is needed
- Move up if the need becomes urgent
- Clear due dates help keep projects on track

### How It Works

1. Click "Manage Project"
2. Find the "Update Deadline" section
3. Use the datetime picker to select a new date and time
4. Click "Update" to save
5. The deadline is immediately updated

### Current Deadline

- Shows the project's current deadline
- If not set, displays "Not set"
- Use this to check the current deadline before changing it

---

## Troubleshooting

### "Not authorized to manage this project"

- You're not the project creator and not an admin
- Only the project creator or admin can manage a project
- Contact your admin if you need changes made

### "Project not found"

- The project has been deleted
- The project ID is invalid
- Try refreshing the page

### "Manage Project button doesn't appear"

- You're not the owner of the project
- You're not an admin
- Only owners and admins can manage projects

---

## Important Notes

⚠️ **Deletion is Permanent**

- Deleting a project cannot be undone
- The project and all associated data will be removed
- A confirmation dialog appears before deletion for safety

⚠️ **Status Changes Affect Workflow**

- Changing from "Open" to another status stops new requests
- Problem solvers see these status changes
- Ensure status accurately reflects project state

✅ **Automatic Refresh**

- After managing a project, the dashboard automatically refreshes
- You'll see the updated project details
- No manual refresh needed

---

## Examples

### Example 1: Extend a Deadline

1. Project deadline is in 3 days but work isn't done
2. Click "Manage Project"
3. Select new deadline: +7 days from today
4. Click "Update"
5. Deadline is extended, solver knows the new deadline

### Example 2: Cancel a Project

1. A buyer changes their mind about a project
2. Click "Manage Project"
3. Change status to "Cancelled"
4. (Optionally) Delete the project
5. The project is no longer available for new requests

### Example 3: Complete a Project

1. A solver finishes their work and submits
2. You review and accept the submission
3. Change status to "Completed"
4. The project is marked as done

---

## API Reference (For Developers)

### Delete Project

```
DELETE /projects/{project_id}
Authorization: Bearer {token}
Response: 204 No Content
```

### Update Project Status

```
PATCH /projects/{project_id}/status
Authorization: Bearer {token}
Body: { "status": "open|assigned|in_progress|completed|cancelled" }
Response: 200 OK with updated Project object
```

### Update Project Deadline

```
PATCH /projects/{project_id}/deadline
Authorization: Bearer {token}
Body: { "deadline": "2026-02-15T10:30:00Z" }
Response: 200 OK with updated Project object
```

---

## Need Help?

If you encounter issues:

1. Check the error message displayed in the toast notification
2. Verify you have the correct permissions
3. Ensure the project exists and hasn't been deleted
4. Check your browser console (F12) for any JavaScript errors
5. Try refreshing the page and try again
