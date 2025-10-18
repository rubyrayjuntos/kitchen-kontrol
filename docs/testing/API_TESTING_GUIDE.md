# API Testing Guide: Logs System

## Setup

All logs API endpoints require JWT authentication. You'll need to:

1. **Get a JWT token** by logging in:
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```

2. **Use the token** in Authorization header:
```bash
curl http://localhost:3002/api/logs/templates \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## API Endpoints Created (Week 1, Day 5)

### Log Templates API (`/api/logs/templates`)

#### 1. List All Templates
```bash
GET /api/logs/templates
Authorization: Bearer {token}

# Returns:
[
  {
    "id": 1,
    "name": "Equipment Temperatures",
    "description": "Twice-daily temperature checks...",
    "category": "food_safety",
    "frequency": "twice_daily",
    "version": 1,
    "created_at": "2024-01-15T10:00:00Z"
  },
  ...
]
```

#### 2. Get Template with Full Schema
```bash
GET /api/logs/templates/1
Authorization: Bearer {token}

# Returns: Full template including form_schema and ui_schema JSONB
```

#### 3. Create New Template (Admin Only)
```bash
POST /api/logs/templates
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Custom Safety Check",
  "description": "Description here",
  "category": "food_safety",
  "frequency": "daily",
  "form_schema": {
    "type": "object",
    "properties": {
      "checked": {"type": "boolean"}
    },
    "required": ["checked"]
  },
  "ui_schema": {
    "checked": {"ui:widget": "checkbox"}
  }
}
```

#### 4. Update Template (Versioning)
```bash
PUT /api/logs/templates/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "form_schema": {...}
}

# Creates new version, deactivates old
```

#### 5. Delete Template (Soft Delete)
```bash
DELETE /api/logs/templates/1
Authorization: Bearer {token}

# Sets is_active = false, preserves historical data
```

---

### Log Assignments API (`/api/logs/assignments`)

#### 1. Get My Assigned Logs (Staff)
```bash
GET /api/logs/assignments/me
Authorization: Bearer {token}

# Returns logs assigned to current user for TODAY:
# - Direct user assignments
# - Role-based assignments
# - Phase-based assignments (based on current time)
# - Includes completion status from log_submissions
```

#### 2. List All Assignments (Admin)
```bash
GET /api/logs/assignments
Authorization: Bearer {token}

# Query params:
# ?template_id=1
# ?user_id=5
# ?active_only=true
```

#### 3. Create Assignment (Admin)
```bash
POST /api/logs/assignments
Authorization: Bearer {token}
Content-Type: application/json

{
  "log_template_id": 1,
  "user_id": 5,              # XOR: exactly one of user_id, role_id, phase_id
  "due_time": "08:00:00",
  "days_of_week": "Mon,Tue,Wed,Thu,Fri",
  "notes": "Complete before service"
}
```

#### 4. Update Assignment
```bash
PUT /api/logs/assignments/10
Authorization: Bearer {token}
Content-Type: application/json

{
  "due_time": "09:00:00",
  "days_of_week": "all"
}
```

#### 5. Deactivate Assignment
```bash
DELETE /api/logs/assignments/10
Authorization: Bearer {token}

# Soft delete (is_active = false)
```

---

### Log Submissions API (`/api/logs/submissions`)

#### 1. Submit Log Data (Staff)
```bash
POST /api/logs/submissions
Authorization: Bearer {token}
Content-Type: application/json

{
  "log_template_id": 1,
  "log_assignment_id": 10,  # Optional
  "submission_date": "2024-01-15",
  "form_data": {
    "check_time": "morning",
    "walk_in_fridge": 36.5,
    "walk_in_freezer": 0,
    "milk_coolers": 38,
    "warmers": 140,
    "initials": "RS"
  }
}

# Validates form_data against template's JSON Schema using Ajv
# If submission exists for same template/date/user, updates it
```

#### 2. Query Submissions
```bash
GET /api/logs/submissions
Authorization: Bearer {token}

# Query params:
# ?template_id=1
# ?user_id=5
# ?start_date=2024-01-01
# ?end_date=2024-01-31
# ?status=submitted
# ?my_submissions=true
```

#### 3. Get Specific Submission
```bash
GET /api/logs/submissions/42
Authorization: Bearer {token}

# Returns full submission with template schemas
```

#### 4. Update Submission (Corrections)
```bash
PUT /api/logs/submissions/42
Authorization: Bearer {token}
Content-Type: application/json

{
  "form_data": {
    "check_time": "afternoon",
    "walk_in_fridge": 37.0,
    ...
  }
}

# Re-validates against schema
```

#### 5. Get Summary Statistics
```bash
GET /api/logs/submissions/stats/summary
Authorization: Bearer {token}

# Query params:
# ?start_date=2024-01-01
# ?end_date=2024-01-31
# ?template_id=1

# Returns:
[
  {
    "template_name": "Equipment Temperatures",
    "category": "food_safety",
    "total_submissions": 150,
    "unique_users": 5,
    "completed_count": 148,
    "first_submission": "2024-01-01",
    "last_submission": "2024-01-31"
  }
]
```

---

## Database Verification

### Check Seeded Templates
```bash
docker exec kitchen-kontrol-db-1 psql -U postgres -d kitchendb -c \
  "SELECT id, name, category, frequency FROM log_templates;"
```

Expected output:
```
 id |              name               |  category      | frequency
----+---------------------------------+----------------+-------------
  1 | Equipment Temperatures          | food_safety    | twice_daily
  2 | Food Temperatures               | food_safety    | per_service
  3 | Planogram Cleaning Verification | operations     | daily
  4 | Sanitation Setup                | food_safety    | daily
  5 | Reimbursable Meals Count        | usda_compliance| per_meal
```

### View Template Schema
```bash
docker exec kitchen-kontrol-db-1 psql -U postgres -d kitchendb -c \
  "SELECT form_schema->'properties' FROM log_templates WHERE id = 1;"
```

---

## Test Workflow (Requires Auth)

### 1. Get Auth Token
```bash
TOKEN=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.token')

echo $TOKEN
```

### 2. List Templates
```bash
curl -s http://localhost:3002/api/logs/templates \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

### 3. Create Assignment
```bash
curl -X POST http://localhost:3002/api/logs/assignments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "log_template_id": 1,
    "user_id": 1,
    "due_time": "08:00:00",
    "days_of_week": "Mon,Tue,Wed,Thu,Fri"
  }' | jq '.'
```

### 4. Get My Assignments
```bash
curl -s http://localhost:3002/api/logs/assignments/me \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

### 5. Submit Log
```bash
curl -X POST http://localhost:3002/api/logs/submissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "log_template_id": 1,
    "form_data": {
      "check_time": "morning",
      "walk_in_fridge": 36.5,
      "walk_in_freezer": 0,
      "milk_coolers": 38,
      "warmers": 140,
      "initials": "JD"
    }
  }' | jq '.'
```

### 6. Query Submissions
```bash
curl -s "http://localhost:3002/api/logs/submissions?my_submissions=true" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

---

## Common Issues

### 1. "Cannot GET /api/logs/templates"
**Cause**: Old server instance running (without new routes)  
**Fix**: Restart server with latest code

### 2. "No token, authorization denied"
**Cause**: Missing or invalid JWT token  
**Fix**: Get fresh token via `/api/auth/login`

### 3. "Form data validation failed"
**Cause**: Submitted form_data doesn't match template's JSON Schema  
**Fix**: Check template schema and adjust form_data

### 4. "Must specify exactly one of: user_id, role_id, or phase_id"
**Cause**: XOR constraint violation in log_assignments  
**Fix**: Provide EXACTLY ONE assignment target

### 5. "A submission for this log already exists today"
**Cause**: Unique constraint: one submission per template/date/user  
**Fix**: Use PUT /api/logs/submissions/:id to update existing

---

## Next Steps (Phase 2)

After auth is configured and endpoints are tested:

1. **Build FormRenderer** component in React
2. **Create field components** (TextInput, NumberInput, etc.)
3. **Refactor LogsView** to fetch from `/api/logs/assignments/me`
4. **Build LogAssignmentWidget** for admin assignment creation

---

## Notes

- All routes use PostgreSQL via `db.query()` (node-pg-migrate compatible)
- JSON Schema validation via Ajv v8 + ajv-formats
- Versioning strategy: immutable templates with `parent_template_id` FK
- Soft deletes preserve historical data integrity
- Audit logging on all mutations
- JSONB indices enable fast queries on form_data
