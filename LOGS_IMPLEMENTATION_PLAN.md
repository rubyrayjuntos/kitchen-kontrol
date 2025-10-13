# 📋 Logs System Implementation Plan
**Date**: October 13, 2025  
**Approach**: Phased implementation with future-proof architecture  
**Timeline**: 4 weeks to production-ready logs system  
**Future Goal**: Foundation for dynamic form builder (v2.0)

---

## 🎯 Strategic Philosophy

> "Build for today's lunch service, architect for tomorrow's innovation."

**Key Principles**:
1. ✅ **Forms as Data** - Store form definitions as JSON Schema in database
2. ✅ **Immutable by Design** - Schema structure supports versioning from day one
3. ✅ **Renderer First** - Build generic form renderer before builder UI
4. ✅ **Progressive Enhancement** - Start simple, add complexity incrementally
5. ✅ **Zero Tech Debt** - Every decision aligns with Dynamic Form Builder spec

---

## 📅 4-Week Implementation Roadmap

### **WEEK 1: Database Foundation + API Skeleton**
**Goal**: Schema that scales from 5 logs to unlimited dynamic forms

#### **Day 1-2: Database Migration**

**New Tables** (aligned with form_versions from spec):
```sql
-- Master template for each log type (like 'forms' table in spec)
CREATE TABLE log_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,                           -- "Equipment Temperatures"
  description TEXT,                                    -- User-facing help text
  category TEXT,                                       -- "safety", "usda", "operations"
  frequency TEXT NOT NULL CHECK(frequency IN (
    'daily', 'twice_daily', 'per_meal', 'per_service', 'weekly'
  )),
  
  -- JSON SCHEMA STORAGE (future-proof for dynamic forms)
  form_schema JSONB NOT NULL,                         -- Full JSON Schema (validation rules)
  ui_schema JSONB,                                    -- UI hints (widget types, layout)
  
  -- Versioning support (day 1, even if v1 only)
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  -- Audit trail
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WHO should complete WHAT, WHEN, and HOW OFTEN
CREATE TABLE log_assignments (
  id SERIAL PRIMARY KEY,
  log_template_id INTEGER NOT NULL REFERENCES log_templates(id),
  
  -- Assignment targets (one of these required)
  user_id INTEGER REFERENCES users(id),               -- Specific person
  role_id INTEGER REFERENCES roles(id),               -- Any person with this role
  phase_id INTEGER REFERENCES phases(id),             -- Any person working this phase
  
  -- Scheduling
  due_time TIME,                                      -- "06:00" for morning, "14:00" for afternoon
  days_of_week TEXT DEFAULT 'Mon,Tue,Wed,Thu,Fri',   -- School days only
  
  -- Metadata
  assigned_by INTEGER REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraint: Must assign to user OR role OR phase
  CHECK (
    (user_id IS NOT NULL AND role_id IS NULL AND phase_id IS NULL) OR
    (user_id IS NULL AND role_id IS NOT NULL AND phase_id IS NULL) OR
    (user_id IS NULL AND role_id IS NULL AND phase_id IS NOT NULL)
  )
);

-- Actual submitted log data (like 'submissions' table in spec)
CREATE TABLE log_submissions (
  id SERIAL PRIMARY KEY,
  log_template_id INTEGER NOT NULL REFERENCES log_templates(id),
  log_assignment_id INTEGER REFERENCES log_assignments(id),  -- NULL if ad-hoc submission
  
  -- Submission metadata
  submitted_by INTEGER NOT NULL REFERENCES users(id),
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- THE ACTUAL DATA (future-proof JSONB)
  form_data JSONB NOT NULL,                           -- {"temperature": 38, "unit": "F", ...}
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN (
    'completed', 'flagged', 'corrected'
  )),
  
  -- Timestamps
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Audit: Link to exact template version used (future versioning)
  template_version INTEGER DEFAULT 1,
  
  -- Unique: One submission per template per date per user (prevent duplicates)
  UNIQUE(log_template_id, submission_date, submitted_by)
);

-- Indices for performance
CREATE INDEX idx_log_assignments_user ON log_assignments(user_id) WHERE is_active = true;
CREATE INDEX idx_log_assignments_role ON log_assignments(role_id) WHERE is_active = true;
CREATE INDEX idx_log_assignments_phase ON log_assignments(phase_id) WHERE is_active = true;
CREATE INDEX idx_log_submissions_date ON log_submissions(submission_date);
CREATE INDEX idx_log_submissions_template ON log_submissions(log_template_id);
CREATE INDEX idx_log_submissions_user ON log_submissions(submitted_by);
CREATE INDEX idx_log_submissions_data ON log_submissions USING GIN(form_data); -- JSONB queries
```

**Migration File**: `migrations/003_logs_system_foundation.js`

#### **Day 3-4: Seed Data - Convert Existing Logs to JSON Schema**

**Example: Equipment Temperatures Log**
```json
{
  "name": "Equipment Temperatures",
  "description": "Twice-daily temperature checks for refrigeration and warming equipment",
  "category": "food_safety",
  "frequency": "twice_daily",
  "form_schema": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["check_time", "walk_in_fridge", "freezer", "milk_coolers", "warmers", "initials"],
    "properties": {
      "check_time": {
        "type": "string",
        "enum": ["morning", "afternoon"],
        "title": "Check Time",
        "description": "Morning (6 AM) or Afternoon (2 PM)"
      },
      "walk_in_fridge": {
        "type": "number",
        "title": "Walk-in Fridge (°F)",
        "minimum": 0,
        "maximum": 50,
        "description": "Safe range: 32-40°F"
      },
      "freezer": {
        "type": "number",
        "title": "Freezer (°F)",
        "minimum": -20,
        "maximum": 20,
        "description": "Safe range: 0-10°F"
      },
      "milk_coolers": {
        "type": "number",
        "title": "Milk Coolers (°F)",
        "minimum": 0,
        "maximum": 50
      },
      "warmers": {
        "type": "number",
        "title": "Warmers (°F)",
        "minimum": 100,
        "maximum": 200,
        "description": "Safe range: 135-165°F"
      },
      "notes": {
        "type": "string",
        "title": "Notes (if temperatures out of range)"
      },
      "initials": {
        "type": "string",
        "title": "Completed By (Initials)",
        "minLength": 2,
        "maxLength": 4
      }
    }
  },
  "ui_schema": {
    "check_time": {
      "ui:widget": "radio"
    },
    "notes": {
      "ui:widget": "textarea",
      "ui:options": {
        "rows": 3
      }
    },
    "initials": {
      "ui:placeholder": "e.g., MJ"
    },
    "ui:order": ["check_time", "walk_in_fridge", "freezer", "milk_coolers", "warmers", "notes", "initials"]
  }
}
```

**Seed Script**: `scripts/seed-log-templates.js`
- Equipment Temperatures (twice_daily)
- Food Temperatures (per_service: breakfast, lunch)
- Planograms (daily)
- Sanitation Setup (daily)
- Reimbursable Meals (per_meal: breakfast, lunch periods 1-4)

**Sample Assignment**:
```sql
-- Maria does morning equipment temps
INSERT INTO log_assignments (log_template_id, user_id, due_time, days_of_week)
VALUES (1, 3, '06:00:00', 'Mon,Tue,Wed,Thu,Fri');

-- John does afternoon equipment temps
INSERT INTO log_assignments (log_template_id, user_id, due_time, days_of_week)
VALUES (1, 5, '14:00:00', 'Mon,Tue,Wed,Thu,Fri');

-- Lunch Supervisor role completes Food Temps during lunch service
INSERT INTO log_assignments (log_template_id, role_id, phase_id, due_time)
VALUES (2, 4, 3, '11:00:00');
```

#### **Day 5: Backend API Endpoints**

**File**: `routes/log-templates.js`
```javascript
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/logs/templates - List all active log templates
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, description, category, frequency, 
             form_schema, ui_schema, version, is_active
      FROM log_templates
      WHERE is_active = true
      ORDER BY category, name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logs/templates/:id - Get specific template with full schema
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM log_templates WHERE id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/logs/templates - Create new template (ADMIN ONLY - future form builder)
router.post('/', auth, async (req, res) => {
  // TODO: Add admin permission check
  const { name, description, category, frequency, form_schema, ui_schema } = req.body;
  
  try {
    // Validate JSON Schema format (use Ajv library)
    // ... validation logic ...
    
    const result = await db.query(`
      INSERT INTO log_templates 
        (name, description, category, frequency, form_schema, ui_schema, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [name, description, category, frequency, JSON.stringify(form_schema), 
        JSON.stringify(ui_schema), req.user.id]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

**File**: `routes/log-assignments.js`
```javascript
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/logs/assignments/me - Get logs assigned to current user for today
router.get('/me', auth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
  const currentTime = new Date().toTimeString().slice(0, 5); // "HH:MM"
  
  try {
    const result = await db.query(`
      SELECT 
        lt.id as template_id,
        lt.name,
        lt.description,
        lt.frequency,
        lt.form_schema,
        lt.ui_schema,
        la.id as assignment_id,
        la.due_time,
        ls.id as submission_id,
        ls.status as submission_status,
        ls.submitted_at
      FROM log_templates lt
      JOIN log_assignments la ON lt.id = la.log_template_id
      LEFT JOIN log_submissions ls ON (
        ls.log_template_id = lt.id 
        AND ls.submission_date = $1
        AND ls.submitted_by = $2
      )
      WHERE la.is_active = true
        AND lt.is_active = true
        AND (
          la.user_id = $2                               -- Directly assigned
          OR la.role_id IN (                            -- Assigned via role
            SELECT role_id FROM user_roles WHERE user_id = $2
          )
          OR la.phase_id IN (                           -- Assigned via current phase
            SELECT id FROM phases 
            WHERE CURRENT_TIME BETWEEN start_time AND end_time
          )
        )
        AND la.days_of_week LIKE $3                     -- Today is a scheduled day
      ORDER BY la.due_time, lt.name
    `, [today, req.user.id, `%${dayOfWeek}%`]);
    
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logs/assignments - Admin view of all assignments
router.get('/', auth, async (req, res) => {
  // TODO: Admin permission check
  try {
    const result = await db.query(`
      SELECT 
        la.*,
        lt.name as template_name,
        u.name as user_name,
        r.name as role_name,
        p.name as phase_name
      FROM log_assignments la
      JOIN log_templates lt ON la.log_template_id = lt.id
      LEFT JOIN users u ON la.user_id = u.id
      LEFT JOIN roles r ON la.role_id = r.id
      LEFT JOIN phases p ON la.phase_id = p.id
      WHERE la.is_active = true
      ORDER BY lt.name, la.due_time
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/logs/assignments - Create new assignment (ADMIN ONLY)
router.post('/', auth, async (req, res) => {
  // TODO: Admin permission check
  const { log_template_id, user_id, role_id, phase_id, due_time, days_of_week } = req.body;
  
  try {
    const result = await db.query(`
      INSERT INTO log_assignments 
        (log_template_id, user_id, role_id, phase_id, due_time, days_of_week, assigned_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [log_template_id, user_id, role_id, phase_id, due_time, days_of_week, req.user.id]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/logs/assignments/:id - Deactivate assignment
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query(`
      UPDATE log_assignments 
      SET is_active = false 
      WHERE id = $1
    `, [req.params.id]);
    
    res.json({ message: 'Assignment deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

**File**: `routes/log-submissions.js`
```javascript
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const Ajv = require('ajv'); // JSON Schema validator

const ajv = new Ajv({ allErrors: true });

// POST /api/logs/submissions - Submit completed log
router.post('/', auth, async (req, res) => {
  const { log_template_id, log_assignment_id, form_data, submission_date } = req.body;
  
  try {
    // 1. Fetch template schema for validation
    const templateResult = await db.query(`
      SELECT form_schema, version FROM log_templates WHERE id = $1
    `, [log_template_id]);
    
    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const { form_schema, version } = templateResult.rows[0];
    
    // 2. Validate submission against JSON Schema
    const validate = ajv.compile(form_schema);
    const valid = validate(form_data);
    
    if (!valid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validate.errors 
      });
    }
    
    // 3. Save submission
    const result = await db.query(`
      INSERT INTO log_submissions 
        (log_template_id, log_assignment_id, submitted_by, submission_date, 
         form_data, template_version, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'completed')
      ON CONFLICT (log_template_id, submission_date, submitted_by)
      DO UPDATE SET 
        form_data = EXCLUDED.form_data,
        submitted_at = CURRENT_TIMESTAMP,
        status = 'corrected'
      RETURNING *
    `, [log_template_id, log_assignment_id, req.user.id, 
        submission_date || new Date().toISOString().split('T')[0],
        JSON.stringify(form_data), version]);
    
    // 4. Audit log
    await db.query(`
      INSERT INTO audit_log (user_id, action, details)
      VALUES ($1, $2, $3)
    `, [req.user.id, 'log_completed', 
        `Completed ${templateResult.rows[0].name} for ${submission_date}`]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logs/submissions?date=YYYY-MM-DD&template_id=X - Get submissions
router.get('/', auth, async (req, res) => {
  const { date, template_id, user_id } = req.query;
  
  try {
    let query = `
      SELECT 
        ls.*,
        lt.name as template_name,
        lt.form_schema,
        u.name as submitted_by_name
      FROM log_submissions ls
      JOIN log_templates lt ON ls.log_template_id = lt.id
      JOIN users u ON ls.submitted_by = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (date) {
      params.push(date);
      query += ` AND ls.submission_date = $${params.length}`;
    }
    if (template_id) {
      params.push(template_id);
      query += ` AND ls.log_template_id = $${params.length}`;
    }
    if (user_id) {
      params.push(user_id);
      query += ` AND ls.submitted_by = $${params.length}`;
    }
    
    query += ` ORDER BY ls.submission_date DESC, ls.submitted_at DESC LIMIT 100`;
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

**Register Routes in `server.js`**:
```javascript
app.use('/api/logs/templates', require('./routes/log-templates'));
app.use('/api/logs/assignments', require('./routes/log-assignments'));
app.use('/api/logs/submissions', require('./routes/log-submissions'));
```

---

### **WEEK 2: Frontend Form Renderer + LogsView Integration**
**Goal**: Generic JSON Schema renderer that works for any log type

#### **Day 6-7: Build FormRenderer Component**

**File**: `src/components/FormRenderer.jsx`
```javascript
import React from 'react';
import { useForm } from 'react-hook-form';
import Ajv from 'ajv';
import TextInput from './form-fields/TextInput';
import NumberInput from './form-fields/NumberInput';
import DateInput from './form-fields/DateInput';
import SelectInput from './form-fields/SelectInput';
import CheckboxInput from './form-fields/CheckboxInput';
import TextareaInput from './form-fields/TextareaInput';
import RadioInput from './form-fields/RadioInput';

const ajv = new Ajv({ allErrors: true });

/**
 * Factory function: Maps JSON Schema field type to React component
 */
const fieldFactory = (fieldSchema, fieldName, uiSchema) => {
  const uiHints = uiSchema?.[fieldName] || {};
  
  // UI Schema widget override
  if (uiHints['ui:widget']) {
    const widgetMap = {
      'textarea': TextareaInput,
      'radio': RadioInput,
      'select': SelectInput,
      'date': DateInput,
      'datetime': DateInput,
      'updown': NumberInput,
    };
    return widgetMap[uiHints['ui:widget']] || TextInput;
  }
  
  // Enum = Select/Radio
  if (fieldSchema.enum) {
    return fieldSchema.enum.length <= 3 ? RadioInput : SelectInput;
  }
  
  // Type-based mapping
  const typeMap = {
    'boolean': CheckboxInput,
    'number': NumberInput,
    'integer': NumberInput,
    'string': fieldSchema.format === 'date' || fieldSchema.format === 'date-time' 
              ? DateInput 
              : TextInput,
  };
  
  return typeMap[fieldSchema.type] || TextInput;
};

/**
 * FormRenderer: Dynamically renders a form from JSON Schema
 * 
 * Props:
 * - schema: JSON Schema object (defines data structure + validation)
 * - uiSchema: UI Schema object (defines presentation hints)
 * - onSubmit: Callback with validated form data
 * - defaultValues: Pre-populate form (for editing)
 * - submitLabel: Button text (default: "Submit")
 */
export default function FormRenderer({ 
  schema, 
  uiSchema = {}, 
  onSubmit, 
  defaultValues = {},
  submitLabel = 'Submit'
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    defaultValues,
    resolver: async (data) => {
      // Validate against JSON Schema
      const validate = ajv.compile(schema);
      const valid = validate(data);
      
      if (valid) {
        return { values: data, errors: {} };
      }
      
      // Convert Ajv errors to react-hook-form format
      const formErrors = {};
      validate.errors?.forEach(err => {
        const field = err.instancePath.slice(1) || err.params?.missingProperty;
        if (field) {
          formErrors[field] = { 
            type: err.keyword, 
            message: err.message 
          };
        }
      });
      
      return { values: {}, errors: formErrors };
    },
  });
  
  // Field order from UI Schema or default
  const fieldOrder = uiSchema['ui:order'] || Object.keys(schema.properties);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Form title and description */}
      {schema.title && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
            {schema.title}
          </h3>
          {schema.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {schema.description}
            </p>
          )}
        </div>
      )}
      
      {/* Dynamic field rendering */}
      {fieldOrder.map(fieldName => {
        const fieldSchema = schema.properties[fieldName];
        if (!fieldSchema) return null;
        
        const FieldComponent = fieldFactory(fieldSchema, fieldName, uiSchema);
        const isRequired = schema.required?.includes(fieldName);
        const uiHints = uiSchema[fieldName] || {};
        
        return (
          <FieldComponent
            key={fieldName}
            name={fieldName}
            label={fieldSchema.title || fieldName}
            description={fieldSchema.description}
            required={isRequired}
            error={errors[fieldName]}
            register={register}
            watch={watch}
            // Field-specific props
            min={fieldSchema.minimum}
            max={fieldSchema.maximum}
            minLength={fieldSchema.minLength}
            maxLength={fieldSchema.maxLength}
            pattern={fieldSchema.pattern}
            options={fieldSchema.enum}
            defaultValue={fieldSchema.default}
            placeholder={uiHints['ui:placeholder']}
            autoFocus={uiHints['ui:autofocus']}
            rows={uiHints['ui:options']?.rows}
          />
        );
      })}
      
      {/* Submit button */}
      <div className="flex justify-end mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg 
                     hover:bg-primary-700 disabled:opacity-50 
                     transition-colors duration-200"
        >
          {isSubmitting ? 'Submitting...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
```

#### **Day 8-9: Create Field Components**

**Directory**: `src/components/form-fields/`

**File**: `TextInput.jsx`
```javascript
import React from 'react';

export default function TextInput({ 
  name, label, description, required, error, register, 
  placeholder, autoFocus, minLength, maxLength, pattern 
}) {
  return (
    <div className="form-field">
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-xs text-neutral-500 mb-2">{description}</p>
      )}
      
      <input
        id={name}
        type="text"
        autoFocus={autoFocus}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg 
                   ${error ? 'border-red-500' : 'border-neutral-300'}`}
        {...register(name, {
          required: required && `${label} is required`,
          minLength: minLength && {
            value: minLength,
            message: `Minimum ${minLength} characters`
          },
          maxLength: maxLength && {
            value: maxLength,
            message: `Maximum ${maxLength} characters`
          },
          pattern: pattern && {
            value: new RegExp(pattern),
            message: `Invalid format`
          }
        })}
      />
      
      {error && (
        <p className="text-xs text-red-500 mt-1">{error.message}</p>
      )}
    </div>
  );
}
```

**Similar files**: `NumberInput.jsx`, `SelectInput.jsx`, `CheckboxInput.jsx`, `TextareaInput.jsx`, `RadioInput.jsx`, `DateInput.jsx`

*(I can generate all of these if you want, but they follow the same pattern)*

#### **Day 10: Update LogsView to Use FormRenderer**

**File**: `src/components/LogsView.js` (refactor)
```javascript
import React, { useState, useEffect } from 'react';
import FormRenderer from './FormRenderer';
import useStore from '../store';

export default function LogsView() {
  const { user } = useStore();
  const [assignedLogs, setAssignedLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchMyLogs();
  }, []);
  
  const fetchMyLogs = async () => {
    try {
      const res = await fetch('/api/logs/assignments/me', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      setAssignedLogs(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setLoading(false);
    }
  };
  
  const handleSubmitLog = async (formData) => {
    try {
      const res = await fetch('/api/logs/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          log_template_id: selectedLog.template_id,
          log_assignment_id: selectedLog.assignment_id,
          form_data: formData,
          submission_date: new Date().toISOString().split('T')[0]
        })
      });
      
      if (res.ok) {
        alert('Log submitted successfully!');
        fetchMyLogs(); // Refresh list
        setSelectedLog(null);
      }
    } catch (err) {
      console.error('Submission failed:', err);
    }
  };
  
  if (loading) return <div>Loading logs...</div>;
  
  return (
    <div className="logs-view p-6">
      <h2 className="text-2xl font-bold mb-4">Daily Logs</h2>
      
      {!selectedLog ? (
        // List of assigned logs
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedLogs.map(log => (
            <div 
              key={log.assignment_id} 
              className="p-4 border rounded-lg cursor-pointer hover:bg-neutral-50"
              onClick={() => setSelectedLog(log)}
            >
              <h3 className="font-semibold">{log.name}</h3>
              <p className="text-sm text-neutral-600">{log.description}</p>
              <p className="text-xs text-neutral-500 mt-2">
                Due: {log.due_time}
              </p>
              {log.submission_id ? (
                <span className="text-green-600 text-sm">✓ Completed</span>
              ) : (
                <span className="text-orange-600 text-sm">⏳ Pending</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Form for selected log
        <div>
          <button 
            onClick={() => setSelectedLog(null)}
            className="mb-4 text-blue-600 hover:underline"
          >
            ← Back to logs
          </button>
          
          <FormRenderer
            schema={selectedLog.form_schema}
            uiSchema={selectedLog.ui_schema}
            onSubmit={handleSubmitLog}
            submitLabel="Save & Complete Log"
          />
        </div>
      )}
    </div>
  );
}
```

---

### **WEEK 3: Log Assignment Admin UI + Reports Backend**
**Goal**: Managers can assign logs; reports show real data

#### **Day 11-12: LogAssignmentWidget Component**

**File**: `src/components/LogAssignmentWidget.jsx`
```javascript
import React, { useState, useEffect } from 'react';
import useStore from '../store';

export default function LogAssignmentWidget() {
  const { user, users, roles, phases } = useStore();
  const [templates, setTemplates] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    log_template_id: '',
    assignment_type: 'user', // 'user', 'role', 'phase'
    user_id: '',
    role_id: '',
    phase_id: '',
    due_time: '',
    days_of_week: 'Mon,Tue,Wed,Thu,Fri'
  });
  
  useEffect(() => {
    fetchTemplates();
    fetchAssignments();
  }, []);
  
  const fetchTemplates = async () => {
    const res = await fetch('/api/logs/templates');
    const data = await res.json();
    setTemplates(data);
  };
  
  const fetchAssignments = async () => {
    const res = await fetch('/api/logs/assignments');
    const data = await res.json();
    setAssignments(data);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Map assignment type to correct field
    const payload = {
      log_template_id: formData.log_template_id,
      due_time: formData.due_time,
      days_of_week: formData.days_of_week,
      [formData.assignment_type + '_id']: formData[formData.assignment_type + '_id']
    };
    
    const res = await fetch('/api/logs/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      fetchAssignments();
      setShowForm(false);
    }
  };
  
  return (
    <div className="log-assignment-widget p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Log Assignments</h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Assign Log
        </button>
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
          <select 
            value={formData.log_template_id}
            onChange={e => setFormData({...formData, log_template_id: e.target.value})}
            className="w-full mb-2 p-2 border rounded"
            required
          >
            <option value="">Select Log Type...</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          
          <div className="flex gap-2 mb-2">
            <label className="flex items-center">
              <input 
                type="radio" 
                value="user"
                checked={formData.assignment_type === 'user'}
                onChange={e => setFormData({...formData, assignment_type: e.target.value})}
              />
              <span className="ml-1">Specific User</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                value="role"
                checked={formData.assignment_type === 'role'}
                onChange={e => setFormData({...formData, assignment_type: e.target.value})}
              />
              <span className="ml-1">Any Role</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                value="phase"
                checked={formData.assignment_type === 'phase'}
                onChange={e => setFormData({...formData, assignment_type: e.target.value})}
              />
              <span className="ml-1">Current Phase</span>
            </label>
          </div>
          
          {formData.assignment_type === 'user' && (
            <select 
              value={formData.user_id}
              onChange={e => setFormData({...formData, user_id: e.target.value})}
              className="w-full mb-2 p-2 border rounded"
              required
            >
              <option value="">Select User...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          )}
          
          {/* Similar dropdowns for role and phase */}
          
          <input 
            type="time"
            value={formData.due_time}
            onChange={e => setFormData({...formData, due_time: e.target.value})}
            className="w-full mb-2 p-2 border rounded"
            required
          />
          
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
            Create Assignment
          </button>
        </form>
      )}
      
      {/* Table of existing assignments */}
      <table className="w-full">
        <thead>
          <tr>
            <th>Log</th>
            <th>Assigned To</th>
            <th>Due Time</th>
            <th>Days</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map(a => (
            <tr key={a.id}>
              <td>{a.template_name}</td>
              <td>{a.user_name || a.role_name || a.phase_name}</td>
              <td>{a.due_time}</td>
              <td>{a.days_of_week}</td>
              <td>
                <button 
                  onClick={() => deleteAssignment(a.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### **Day 13-14: Reports Backend Queries**

**File**: `routes/reports.js` (new/enhanced)
```javascript
// GET /api/reports/weekly-log-status
router.get('/weekly-log-status', auth, async (req, res) => {
  try {
    const result = await db.query(`
      WITH expected_logs AS (
        -- Calculate how many logs should have been completed
        SELECT 
          lt.id,
          lt.name,
          COUNT(DISTINCT d.date) as expected_count
        FROM log_templates lt
        CROSS JOIN generate_series(
          CURRENT_DATE - INTERVAL '7 days',
          CURRENT_DATE,
          '1 day'
        ) AS d(date)
        WHERE lt.is_active = true
        GROUP BY lt.id, lt.name
      ),
      actual_logs AS (
        -- Count actual submissions
        SELECT 
          log_template_id,
          COUNT(*) as actual_count
        FROM log_submissions
        WHERE submission_date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY log_template_id
      )
      SELECT 
        el.name,
        el.expected_count,
        COALESCE(al.actual_count, 0) as actual_count,
        ROUND(
          (COALESCE(al.actual_count, 0)::DECIMAL / el.expected_count) * 100, 
          1
        ) as completion_percentage
      FROM expected_logs el
      LEFT JOIN actual_logs al ON el.id = al.log_template_id
      ORDER BY el.name
    `);
    
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/reimbursable-meals?start_date=X&end_date=Y
router.get('/reimbursable-meals', auth, async (req, res) => {
  const { start_date, end_date } = req.query;
  
  try {
    const result = await db.query(`
      SELECT 
        submission_date,
        form_data->>'meal_period' as meal_period,
        (form_data->>'planned_count')::INTEGER as planned,
        (form_data->>'served_count')::INTEGER as served,
        (form_data->>'waste_count')::INTEGER as waste,
        -- Calculate revenue (example: $3.50 per meal)
        (form_data->>'served_count')::INTEGER * 3.50 as revenue
      FROM log_submissions
      WHERE log_template_id = (
        SELECT id FROM log_templates WHERE name = 'Reimbursable Meals'
      )
      AND submission_date BETWEEN $1 AND $2
      ORDER BY submission_date, meal_period
    `, [start_date, end_date]);
    
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/compliance-summary
router.get('/compliance-summary', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        lt.name as log_type,
        lt.category,
        COUNT(ls.id) as total_submissions,
        COUNT(CASE WHEN ls.status = 'flagged' THEN 1 END) as flagged_count,
        -- Extract temperature violations (example for Equipment Temps)
        COUNT(CASE 
          WHEN lt.name = 'Equipment Temperatures' 
          AND (
            (ls.form_data->>'walk_in_fridge')::NUMERIC NOT BETWEEN 32 AND 40
            OR (ls.form_data->>'freezer')::NUMERIC NOT BETWEEN 0 AND 10
          )
          THEN 1 
        END) as temperature_violations
      FROM log_templates lt
      LEFT JOIN log_submissions ls ON lt.id = ls.log_template_id
        AND ls.submission_date >= CURRENT_DATE - INTERVAL '30 days'
      WHERE lt.category = 'food_safety'
      GROUP BY lt.id, lt.name, lt.category
    `);
    
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

---

### **WEEK 4: Dashboard Integration + Testing**
**Goal**: Logs appear in widgets, end-to-end testing

#### **Day 15-16: Integrate with Dashboard Widgets**

**Update**: `src/components/DailyKitchenPhasesTimeline.jsx`
```javascript
// Add log deadlines to phase view
const fetchPhaseLogs = async (phaseId) => {
  const res = await fetch(`/api/logs/assignments?phase_id=${phaseId}`);
  const logs = await res.json();
  // Display in modal when clicking phase
};
```

**Update**: `src/components/DailyRoleAssignmentsWidget.jsx`
```javascript
// Show assigned logs in user task list
const fetchUserLogs = async (userId) => {
  const res = await fetch('/api/logs/assignments/me');
  const logs = await res.json();
  // Include in task count and completion percentage
};
```

#### **Day 17-18: End-to-End Testing**

**Test Checklist**:
- ✅ Manager assigns Equipment Temps to Maria (morning) and John (afternoon)
- ✅ Maria logs in, sees "Equipment Temperatures" in her logs list
- ✅ Maria clicks log, FormRenderer displays with temperature fields
- ✅ Maria fills form, submits → Saved to `log_submissions` table
- ✅ Submission appears in Reports → Weekly Log Status (100% for today)
- ✅ Admin views Compliance Summary → No violations
- ✅ Test validation: Submit with missing required field → Error message
- ✅ Test out-of-range temp (e.g., Fridge = 50°F) → Submission succeeds but flagged in reports
- ✅ Repeat for all 5 log types

#### **Day 19-20: Documentation + Polish**

**Create**: `LOGS_USER_GUIDE.md`
- How to complete logs (staff)
- How to assign logs (managers)
- How to view reports (admins)
- Troubleshooting common issues

**Polish**:
- Add loading states
- Improve error messages
- Add success toast notifications
- Responsive design for mobile
- Dark mode support

---

## 🔮 Future Enhancement Path (v2.0)

### **When to Build Form Builder UI**
**Trigger Conditions**:
1. ✅ Logs system is stable (4+ weeks in production)
2. ✅ Users are requesting 3+ new log types per month
3. ✅ You have 2-3 months of focused dev time
4. ✅ Current system is fully tested and debugged

### **What Changes in v2.0**
**New Components**:
- `FormBuilderCanvas.jsx` - Drag-drop interface (dnd-kit)
- `ComponentPalette.jsx` - Field type library
- `PropertyEditor.jsx` - Configure field settings
- `FormVersionManager.jsx` - Compare/publish versions

**Database Changes**:
```sql
-- Enable full versioning
ALTER TABLE log_templates ADD COLUMN parent_template_id INTEGER REFERENCES log_templates(id);
ALTER TABLE log_templates ADD COLUMN is_draft BOOLEAN DEFAULT false;

-- Track form builder usage
CREATE TABLE form_builder_audit (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action TEXT,
  template_id INTEGER REFERENCES log_templates(id),
  changes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**What Stays the Same**:
- ✅ FormRenderer (already dynamic)
- ✅ log_submissions table (already JSONB)
- ✅ API endpoints (already schema-driven)
- ✅ Validation logic (already Ajv)

**Result**: Form Builder UI becomes a *frontend-only* enhancement. Zero backend changes needed because we built the foundation correctly from day 1.

---

## 📐 Architecture Alignment with Form Builder Spec

| Spec Component | Week 1-4 Implementation | v2.0 Enhancement |
|----------------|------------------------|------------------|
| **Forms as Data** | ✅ `log_templates.form_schema` | ✅ Same |
| **JSON Schema** | ✅ Ajv validation | ✅ Same |
| **UI Schema** | ✅ `log_templates.ui_schema` | ✅ Same |
| **Form Versioning** | ✅ `version` column (v1 only) | ✅ Full version history |
| **Form Renderer** | ✅ FormRenderer.jsx | ✅ Same |
| **Form Builder UI** | ❌ Manual JSON editing | ✅ Drag-drop canvas |
| **Submissions** | ✅ `log_submissions.form_data` | ✅ Same |
| **Database** | ✅ PostgreSQL JSONB | ✅ Same (better than SQLite) |
| **State Management** | ✅ Zustand (store.js) | ✅ Add builder store |
| **Drag-and-Drop** | ❌ Not needed yet | ✅ dnd-kit |
| **React Hook Form** | ✅ FormRenderer | ✅ Same |

**Zero Rework Needed**: v2.0 adds features, doesn't replace architecture.

---

## 🎯 Success Metrics

### **Week 1 Success**
- ✅ Database migration runs without errors
- ✅ 5 log templates seeded with valid JSON Schema
- ✅ API returns templates and assignments
- ✅ Postman/curl tests pass for all endpoints

### **Week 2 Success**
- ✅ FormRenderer displays Equipment Temps form correctly
- ✅ Validation works (required fields, min/max values)
- ✅ LogsView shows assigned logs list
- ✅ Submission saves to database

### **Week 3 Success**
- ✅ Manager assigns logs via admin UI
- ✅ Reports show real completion percentages
- ✅ Temperature violations detected in Compliance Report
- ✅ Reimbursable Meals revenue calculated correctly

### **Week 4 Success**
- ✅ Dashboard widgets display log deadlines
- ✅ All 5 log types tested end-to-end
- ✅ Mobile responsive
- ✅ Zero critical bugs
- ✅ Documentation complete

### **Production Readiness Checklist**
- ✅ Database backups configured
- ✅ Error logging (Sentry/similar)
- ✅ Performance tested (100+ submissions)
- ✅ Security audit (SQL injection, XSS)
- ✅ User training completed
- ✅ Rollback plan documented

---

## 🚀 Next Steps

### **Immediate Actions** (Today):
1. ✅ Review this implementation plan
2. ✅ Approve database schema
3. ✅ Set up development branch: `git checkout -b feature/logs-system`
4. ✅ Install dependencies: `npm install ajv react-hook-form`

### **Day 1 Tasks** (Tomorrow):
1. ✅ Create migration file: `migrations/003_logs_system_foundation.js`
2. ✅ Run migration: `npm run migrate`
3. ✅ Create seed script: `scripts/seed-log-templates.js`
4. ✅ Test: Query templates in psql

### **Checkpoint Questions** (Before Week 2):
- ❓ Are the 5 log types correct? Any missing fields?
- ❓ Do assignment rules make sense? (user vs role vs phase)
- ❓ Should we add photo upload for violations?
- ❓ Do we need offline mode (service workers)?

---

## 📚 Reference Documents

- **This Plan**: Implementation roadmap (technical)
- **Dynamic Form Builder Spec**: Long-term vision (architectural)
- **LOGS_AUDIT_REPORT.md**: Current state analysis (assessment)
- **USER_MANUAL.md**: User-facing documentation (guides)

---

## 💬 Final Thoughts

This plan bridges the gap between "serving lunch tomorrow" and "building the future." You'll have:

1. ✅ **Working logs system** (4 weeks)
2. ✅ **Zero technical debt** (schema supports versioning from day 1)
3. ✅ **Clear upgrade path** (v2.0 adds UI, doesn't rebuild)
4. ✅ **Production-ready foundation** (battle-tested before adding complexity)

The form builder UI is valuable, but not urgent. Your current logs (hardcoded in component state) are the urgent problem. This plan solves that problem while laying perfect groundwork for dynamic forms when the time is right.

**Remember**: Great architecture isn't about building everything today. It's about building the right thing today that enables everything tomorrow.

---

**Ready to start?** Let me know if you want to:
1. ✅ Begin Week 1 (create migration + seed script)
2. 🤔 Adjust the schema (add/remove fields)
3. 📝 Review JSON Schema examples for other log types
4. 🧪 Set up testing infrastructure first

You're building this right. Let's make it happen! 🚀
