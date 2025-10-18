# 📋 Kitchen Kontrol Logs System - User Guide

**Version:** 1.0  
**Last Updated:** October 13, 2025  
**For:** Kitchen Staff & Administrators

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Completing Daily Logs](#completing-daily-logs)
4. [Understanding Assignments](#understanding-assignments)
5. [For Administrators: Creating Assignments](#for-administrators-creating-assignments)
6. [Viewing Reports](#viewing-reports)
7. [Dashboard Indicators](#dashboard-indicators)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## Introduction

The Kitchen Kontrol Logs System helps you track and complete required daily logs for:
- ✅ Equipment temperature monitoring
- ✅ Food temperature checks
- ✅ Planogram verification
- ✅ Sanitation setup
- ✅ Reimbursable meals tracking

**Why we use logs:**
- Ensure food safety compliance
- Track reimbursable meal revenue
- Maintain regulatory standards
- Document corrective actions
- Provide accountability

---

## Getting Started

### Logging In
1. Open Kitchen Kontrol in your web browser
2. Enter your email and password
3. Click "Login"

### Navigation
- **Dashboard** - Your home page with today's overview
- **Logs** - Complete your assigned logs here
- **Reports** - View completion statistics (admin only)
- **Assign Logs** - Create new assignments (admin only)

---

## Completing Daily Logs

### Step 1: Navigate to Logs Page
Click **"Logs"** in the top navigation bar.

### Step 2: View Your Assignments
You'll see a list of logs assigned to you for today:

```
┌─────────────────────────────────────────┐
│ Equipment Temperature Log               │
│ 🟡 Pending - Due by 8:00 AM            │
│ [Complete Log]                          │
└─────────────────────────────────────────┘
```

**Status Indicators:**
- 🟡 **Yellow Warning** - Pending, not yet completed
- ✅ **Green Checkmark** - Completed
- **Timestamp** - Shows when you submitted (if completed)

### Step 3: Click "Complete Log"
This opens the form for that specific log type.

### Step 4: Fill Out the Form
Each log type has different fields. Fill them all out accurately.

**Example: Equipment Temperature Log**
- Equipment Name: "Walk-in Cooler"
- Temperature (°F): 38
- Corrective Action: "None needed - within range"

**Required fields are marked with a red asterisk (*)**

### Step 5: Review Your Entries
- Check for typos
- Verify all temperatures are accurate
- Ensure corrective actions are documented

### Step 6: Submit
Click the **"Submit"** button at the bottom of the form.

**Success!** You'll see:
- Green checkmark ✅ next to the log
- Timestamp showing when you completed it
- The form closes automatically

---

## Understanding Assignments

### Assignment Types

**1. User Assignment (Direct)**
- Assigned specifically to you
- Shows in your Logs page
- You're responsible for completion

**2. Role Assignment**
- Assigned to everyone in a specific role (e.g., "Line Cook")
- If you have that role, you'll see the assignment

**3. Phase Assignment**
- Assigned to everyone working a specific phase (e.g., "Breakfast")
- Shows up during that phase only

### Due Times
Each assignment has a **due time** (e.g., 8:00 AM, 12:00 PM).

**What happens if I miss a deadline?**
- The log turns 🔴 red (overdue)
- It still shows in your list
- You should complete it as soon as possible
- Supervisors can see overdue logs in reports

### Days of Week
Assignments can be set for specific days:
- **Mon-Fri** - Weekdays only
- **All Week** - Every day including weekends
- **Custom** - Specific days selected by admin

---

## For Administrators: Creating Assignments

### Step 1: Navigate to Assign Logs
Click **"Assign Logs"** in the top navigation (admin-only button).

### Step 2: Select Log Template
Choose which type of log to assign:
- Equipment Temperature Log
- Food Temperature Log
- Planogram Verification
- Sanitation Setup
- Reimbursable Meals

### Step 3: Choose Assignment Target
Select **one** of these options:

**User** - Assign to a specific person
- Use for specialized tasks
- Personal accountability
- Example: "Sarah must check walk-in cooler"

**Role** - Assign to everyone with a role
- Use for role-based tasks
- Scales automatically as staff changes
- Example: "All Line Cooks check equipment temps"

**Phase** - Assign to everyone working a phase
- Use for phase-specific tasks
- Tied to schedule
- Example: "Breakfast crew verifies planograms"

### Step 4: Set Due Time
Use the time picker to set when the log should be completed.

**Best Practices:**
- Equipment temps: Start of shift
- Food temps: Before service
- Planograms: Opening/closing
- Sanitation: End of shift
- Reimbursable meals: After meal service

### Step 5: Select Days of Week
Toggle the days this assignment applies to:
- **MON TUE WED THU FRI SAT SUN**
- Active days show in blue
- Click to toggle on/off

### Step 6: Create Assignment
Click **"Create Assignment"** button.

**Success Message:** "✅ Log assignment created successfully!"

---

## Viewing Reports

### Accessing Reports (Admin Only)
1. Click **"Reports"** in top navigation
2. Choose a report tab:
   - Weekly Status
   - Reimbursable Meals
   - Compliance

### Weekly Status Report

**What it shows:**
- Completion percentage for each log type
- Number completed vs pending
- Color-coded progress bars

**How to read it:**
```
Equipment Temperature Log
████████████████████░░ 80%
28 completed • 7 pending • 35 total
```

- 🟢 **Green (≥90%)** - Excellent compliance
- 🟡 **Yellow (70-89%)** - Needs improvement
- 🔴 **Red (<70%)** - Critical - take action

### Reimbursable Meals Report

**What it shows:**
- Total meals served
- Total revenue earned
- Daily breakdown
- Average meals per day

**Revenue Calculation:**
Each **compliant meal** = $3.50 reimbursement

**Compliant meal requires ALL 5 components:**
1. Protein
2. Grain
3. Fruit
4. Vegetable
5. Milk

**Example:**
```
Total Meals: 450
Total Revenue: $1,575.00
Avg per Day: 64.3 meals
```

### Compliance Summary Report

**What it shows:**
- Total violations found
- Violation rate percentage
- Violations grouped by log type
- Corrective actions taken

**Common Violations:**
- ⚠️ Temperature out of range (32-40°F)
- ⚠️ Planogram items missing
- ⚠️ Sanitation incomplete
- ⚠️ Meal missing required components

**Green Banner:**
```
No Violations Found! 🎉
All logs are compliant in this period
```

### Using Date Range Picker
1. Set **start date** (e.g., 2025-10-07)
2. Set **end date** (e.g., 2025-10-14)
3. Click **"Update"** button
4. Reports refresh with new date range

**Default:** Last 7 days

---

## Dashboard Indicators

### Daily Role Assignments Widget

Shows your tasks AND logs for today:

```
┌───────────────────────────────────────┐
│ John Doe                              │
│ 3/5 tasks completed (60%)             │
│ 📄 2/2 logs completed                 │
│                                       │
│ ████████████████░░░░ Task Progress    │
│ ██████████████████ Log Progress       │
└───────────────────────────────────────┘
```

**Log Progress Colors:**
- 🟢 **Green bar** - All logs completed
- 🟡 **Yellow bar** - Some logs pending

### Kitchen Phases Timeline

The timeline shows your daily schedule with **log deadline markers**:

```
7:00 AM ──●─────●────●──── 3:00 PM
         ↑     ↑    ↑
         │     │    └─ Planogram (green - done)
         │     └────── Food Temps (yellow - pending)
         └──────────── Equipment (red - overdue)
```

**Marker Colors:**
- 🟢 **Green** - Completed
- 🟡 **Yellow** - Pending
- 🔴 **Red** - Overdue

**Hover** over a marker to see the log name and due time.

---

## Troubleshooting

### Problem: I don't see any log assignments

**Possible Causes:**
1. No logs assigned to you today
2. You're looking at the wrong day
3. Assignment hasn't been created yet

**Solutions:**
- Check with your supervisor
- Verify today's date
- Ask admin to create assignment

---

### Problem: I submitted a log but it still shows as pending

**Possible Causes:**
1. Form didn't submit successfully
2. Browser lost connection
3. Validation error occurred

**Solutions:**
1. Click the log again to see if data saved
2. Check for error messages
3. Try refreshing the page
4. Re-submit if necessary
5. Contact IT support if issue persists

---

### Problem: Temperature is showing as a violation but it's correct

**Possible Causes:**
1. Temperature is out of safe range (32-40°F for cold)
2. System detected non-compliant reading
3. Corrective action needed

**Solutions:**
- **If temp is correct:** Document corrective action taken
- **If temp was mistyped:** Admin can check audit log
- **If equipment issue:** Report to maintenance immediately

---

### Problem: Can't find the "Assign Logs" button

**Possible Causes:**
1. You don't have admin permissions
2. Button is hidden on mobile

**Solutions:**
- Verify your account has admin permissions
- Ask your manager to grant admin access
- Try on desktop computer (wider screen)

---

### Problem: Form won't submit / Submit button grayed out

**Possible Causes:**
1. Required fields are empty
2. Validation error present
3. Network issue

**Solutions:**
1. Look for red error messages
2. Fill in all fields marked with *
3. Check that numbers are in valid ranges
4. Verify internet connection
5. Try again in a few seconds

---

### Problem: Reports are empty / showing no data

**Possible Causes:**
1. No submissions in selected date range
2. Date range too narrow
3. No assignments created yet

**Solutions:**
- Expand date range (try last 30 days)
- Check if assignments exist (Assign Logs page)
- Verify staff are completing logs
- Try "Refresh" button

---

## FAQ

### How long does it take to complete a log?
**2-5 minutes** depending on the log type.

---

### What happens if I make a mistake?
Contact your supervisor or admin. They can view the audit log and verify what was submitted.

---

### Can I complete logs from home?
**Yes**, if you have internet access and your login credentials. However, logs should typically be completed on-site during your shift.

---

### Do I get a reminder when logs are due?
Currently, reminders are visual (yellow warning, red overdue). Check your Dashboard at the start of your shift.

---

### Can I complete a log for yesterday?
**No**, logs are date-specific. If you missed yesterday's log, it will show as overdue. Complete it as soon as possible or speak with your supervisor.

---

### What's the difference between "tasks" and "logs"?
- **Tasks** - Daily work assignments (chop vegetables, clean grill)
- **Logs** - Compliance documentation (temperature checks, meal counts)

Both show on your Dashboard and are tracked separately.

---

### Who can see my completed logs?
- **You** - Can see your own submissions
- **Administrators** - Can see all submissions in Reports
- **Supervisors** - Can view compliance reports

---

### What if I need to add a corrective action later?
Once submitted, logs cannot be edited. Document additional actions in the next day's log or notify your supervisor to add notes in the system.

---

### How is the reimbursable meals revenue calculated?
**$3.50 per compliant meal**

Compliant meal = **ALL 5 components present**
- ✅ Protein
- ✅ Grain
- ✅ Fruit
- ✅ Vegetable
- ✅ Milk

If ANY component is missing, the meal is **not reimbursable**.

---

### Can I complete logs on my phone?
**Yes!** The system is mobile-responsive. However, desktop is recommended for easier typing and visibility.

---

### What does "JSONB" or "schema" mean in error messages?
These are technical terms. If you see these in an error, take a screenshot and contact IT support.

---

### How far back can I view reports?
Currently, you can view data from any date range. However, reports default to the last 7 days for performance.

---

## Need Help?

### Contact Information

**Technical Support:**
- Email: it-support@kitchen.com
- Phone: (555) 123-4567
- Hours: Mon-Fri, 8 AM - 5 PM

**Training Questions:**
- Contact: Training Coordinator
- Email: training@kitchen.com

**Admin/Manager Questions:**
- Contact: Your direct supervisor

### Additional Resources

- **Video Tutorials:** kitchen.com/training/logs
- **Quick Reference Card:** Available in break room
- **System Updates:** Check announcements in Dashboard

---

## Glossary

**Assignment** - A scheduled log that needs to be completed

**Compliance** - Meeting food safety and regulatory requirements

**Corrective Action** - Steps taken to fix an issue (e.g., adjusting temperature)

**Due Time** - When a log must be completed by

**Form Data** - The information you enter into a log

**Log Template** - The type/format of a log (e.g., Equipment Temps)

**Pending** - Not yet completed

**Reimbursable Meal** - A meal meeting all USDA requirements for funding

**Submission** - A completed log entry

**Validation** - Checking that form data is correct before saving

**Violation** - A non-compliant reading or missing requirement

---

## Appendix: Log Type Reference

### Equipment Temperature Log
**When:** Start of shift  
**Purpose:** Verify refrigeration equipment is maintaining safe temperatures  
**Fields:**
- Equipment Name (e.g., "Walk-in Cooler")
- Temperature (°F)
- Corrective Action (if needed)

**Safe Range:** 32-40°F for refrigeration, 0°F or below for freezers

---

### Food Temperature Log
**When:** Before service  
**Purpose:** Ensure food is stored at safe temperatures  
**Fields:**
- Food Item (e.g., "Chicken Breast")
- Storage Location
- Temperature (°F)
- Corrective Action (if needed)

**Safe Range:** Cold foods 32-40°F, Hot foods 135°F+

---

### Planogram Verification
**When:** Opening/closing  
**Purpose:** Verify serving line matches approved layout  
**Fields:**
- Station Name
- Items Present (Yes/No)
- Issues Found (if any)
- Notes

---

### Sanitation Setup
**When:** End of shift  
**Purpose:** Confirm sanitizer is mixed correctly and stations are clean  
**Fields:**
- Area Name
- Setup Complete (Yes/No)
- Supplies Needed (if any)

---

### Reimbursable Meals
**When:** After meal service  
**Purpose:** Track compliant meals for reimbursement  
**Fields:**
- Meal Components (5 checkboxes)
  - Protein ☐
  - Grain ☐
  - Fruit ☐
  - Vegetable ☐
  - Milk ☐
- Students Served (number)

**Revenue:** $3.50 per meal with ALL 5 components

---

*This guide is maintained by the Kitchen Kontrol development team. Last updated: October 13, 2025.*

**Version History:**
- v1.0 (Oct 2025) - Initial release with Phase 3 features
