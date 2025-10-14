const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

/**
 * GET /api/reports/weekly-log-status
 * 
 * Returns completion statistics for each log template over the past week.
 * 
 * Response format:
 * {
 *   week_start: "2025-10-07",
 *   week_end: "2025-10-13",
 *   templates: [
 *     {
 *       template_id: 1,
 *       template_name: "Equipment Temperature Log",
 *       total_assignments: 35,
 *       completed: 28,
 *       pending: 7,
 *       completion_rate: 80.0
 *     },
 *     ...
 *   ]
 * }
 */
router.get('/weekly-log-status', auth, async (req, res) => {
  try {
    // Calculate date range (last 7 days)
    const weekEnd = new Date();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // Format dates for SQL
    const startDate = weekStart.toISOString().split('T')[0];
    const endDate = weekEnd.toISOString().split('T')[0];

    // Query to get completion statistics per template
    const query = `
      WITH assignment_counts AS (
        -- Count total assignments per template in the date range
        SELECT 
          la.log_template_id as template_id,
          lt.name as template_name,
          lt.category,
          COUNT(DISTINCT la.id) as total_assignments
        FROM log_assignments la
        JOIN log_templates lt ON la.log_template_id = lt.id
        WHERE la.created_at >= $1 AND la.created_at <= $2
        GROUP BY la.log_template_id, lt.name, lt.category
      ),
      submission_counts AS (
        -- Count completed submissions per template
        SELECT 
          ls.log_template_id as template_id,
          COUNT(DISTINCT ls.id) as completed_count
        FROM log_submissions ls
        WHERE ls.submitted_at >= $1 AND ls.submitted_at <= $2
        GROUP BY ls.log_template_id
      )
      SELECT 
        ac.template_id,
        ac.template_name,
        ac.category,
        ac.total_assignments,
        COALESCE(sc.completed_count, 0) as completed,
        (ac.total_assignments - COALESCE(sc.completed_count, 0)) as pending,
        CASE 
          WHEN ac.total_assignments > 0 
          THEN ROUND((COALESCE(sc.completed_count, 0)::numeric / ac.total_assignments::numeric) * 100, 1)
          ELSE 0 
        END as completion_rate
      FROM assignment_counts ac
      LEFT JOIN submission_counts sc ON ac.template_id = sc.template_id
      ORDER BY ac.template_name;
    `;

    const result = await db.query(query, [startDate, endDate]);

    res.json({
      week_start: startDate,
      week_end: endDate,
      templates: result.rows,
    });
  } catch (error) {
    console.error('Error fetching weekly log status:', error);
    res.status(500).json({ error: 'Failed to fetch weekly log status' });
  }
});

/**
 * GET /api/reports/reimbursable-meals
 * 
 * Returns reimbursable meals data and revenue calculations.
 * 
 * Query params:
 * - start_date (optional): Filter from this date
 * - end_date (optional): Filter to this date
 * 
 * Response format:
 * {
 *   date_range: { start: "2025-10-07", end: "2025-10-13" },
 *   summary: {
 *     total_meals: 450,
 *     total_revenue: 1575.00,
 *     reimbursement_rate: 3.50,
 *     avg_meals_per_day: 64.3
 *   },
 *   daily_breakdown: [
 *     {
 *       date: "2025-10-07",
 *       meals: 65,
 *       revenue: 227.50,
 *       submissions: 3
 *     },
 *     ...
 *   ]
 * }
 */
router.get('/reimbursable-meals', auth, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Default to last 7 days if no dates provided
    const endDate = end_date || new Date().toISOString().split('T')[0];
    const startDate = start_date || (() => {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return d.toISOString().split('T')[0];
    })();

    // Get the reimbursable-meals template ID
    const templateResult = await db.query(
      "SELECT id FROM log_templates WHERE slug = 'reimbursable-meals' LIMIT 1"
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reimbursable meals template not found' });
    }

    const templateId = templateResult.rows[0].id;

    // Query to get reimbursable meals data
    // Only count meals where ALL 5 components are present (protein, grain, fruit, vegetable, milk)
    const query = `
      SELECT 
        DATE(ls.submitted_at) as date,
        COUNT(*) as submissions,
        SUM(
          CASE 
            WHEN 
              (ls.form_data->'components'->>'protein')::boolean = true AND
              (ls.form_data->'components'->>'grain')::boolean = true AND
              (ls.form_data->'components'->>'fruit')::boolean = true AND
              (ls.form_data->'components'->>'vegetable')::boolean = true AND
              (ls.form_data->'components'->>'milk')::boolean = true
            THEN (ls.form_data->>'students_served')::integer
            ELSE 0
          END
        ) as total_meals
      FROM log_submissions ls
      WHERE ls.log_template_id = $1
        AND ls.submitted_at >= $2
        AND ls.submitted_at <= $3
      GROUP BY DATE(ls.submitted_at)
      ORDER BY date;
    `;

    const result = await db.query(query, [templateId, startDate, endDate]);

    // Calculate summary statistics
    const reimbursementRate = 3.50; // $3.50 per meal (this could come from a config table)
    
    const totalMeals = result.rows.reduce((sum, row) => sum + parseInt(row.total_meals || 0), 0);
    const totalRevenue = totalMeals * reimbursementRate;
    const daysCount = result.rows.length || 1;
    const avgMealsPerDay = totalMeals / daysCount;

    // Build daily breakdown with revenue
    const dailyBreakdown = result.rows.map(row => ({
      date: row.date,
      meals: parseInt(row.total_meals || 0),
      revenue: parseFloat((parseInt(row.total_meals || 0) * reimbursementRate).toFixed(2)),
      submissions: parseInt(row.submissions),
    }));

    res.json({
      date_range: {
        start: startDate,
        end: endDate,
      },
      summary: {
        total_meals: totalMeals,
        total_revenue: parseFloat(totalRevenue.toFixed(2)),
        reimbursement_rate: reimbursementRate,
        avg_meals_per_day: parseFloat(avgMealsPerDay.toFixed(1)),
      },
      daily_breakdown: dailyBreakdown,
    });
  } catch (error) {
    console.error('Error fetching reimbursable meals report:', error);
    res.status(500).json({ error: 'Failed to fetch reimbursable meals report' });
  }
});

/**
 * GET /api/reports/compliance-summary
 * 
 * Returns compliance violations across all log types.
 * Checks for temperature violations, missing data, and failed checks.
 * 
 * Response format:
 * {
 *   summary: {
 *     total_submissions: 150,
 *     total_violations: 8,
 *     violation_rate: 5.3
 *   },
 *   violations_by_type: [
 *     {
 *       log_type: "Equipment Temperature Log",
 *       violation_count: 3,
 *       violations: [
 *         {
 *           submission_id: 42,
 *           submitted_at: "2025-10-12T08:30:00Z",
 *           submitted_by: "John Doe",
 *           issue: "Temperature out of range",
 *           details: { equipment: "Walk-in Cooler", temperature: 45, threshold: "32-40°F" },
 *           corrective_action: "Adjusted thermostat, monitoring"
 *         },
 *         ...
 *       ]
 *     },
 *     ...
 *   ]
 * }
 */
router.get('/compliance-summary', auth, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Default to last 30 days if no dates provided
    const endDate = end_date || new Date().toISOString().split('T')[0];
    const startDate = start_date || (() => {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return d.toISOString().split('T')[0];
    })();

    // Get all submissions in date range with template info
    const submissionsQuery = `
      SELECT 
        ls.id,
        ls.log_template_id,
        ls.form_data,
        ls.submitted_at,
        ls.submitted_by,
        lt.name as template_name,
        lt.category,
        lt.schema,
        u.name as user_name
      FROM log_submissions ls
      JOIN log_templates lt ON ls.log_template_id = lt.id
      JOIN users u ON ls.submitted_by = u.id
      WHERE ls.submitted_at >= $1 AND ls.submitted_at <= $2
      ORDER BY ls.submitted_at DESC;
    `;

    const result = await db.query(submissionsQuery, [startDate, endDate]);

    // Analyze each submission for compliance violations
    const violationsByType = {};
    let totalViolations = 0;

    result.rows.forEach(submission => {
      const violations = checkCompliance(submission);
      
      if (violations.length > 0) {
        totalViolations += violations.length;

        if (!violationsByType[submission.template_name]) {
          violationsByType[submission.template_name] = {
            log_type: submission.template_name,
            category: submission.category,
            violation_count: 0,
            violations: [],
          };
        }

        violations.forEach(violation => {
          violationsByType[submission.template_name].violation_count++;
          violationsByType[submission.template_name].violations.push({
            submission_id: submission.id,
            submitted_at: submission.submitted_at,
            submitted_by: submission.user_name,
            issue: violation.issue,
            details: violation.details,
            corrective_action: violation.corrective_action,
          });
        });
      }
    });

    res.json({
      date_range: {
        start: startDate,
        end: endDate,
      },
      summary: {
        total_submissions: result.rows.length,
        total_violations: totalViolations,
        violation_rate: result.rows.length > 0 
          ? parseFloat((totalViolations / result.rows.length * 100).toFixed(1))
          : 0,
      },
      violations_by_type: Object.values(violationsByType),
    });
  } catch (error) {
    console.error('Error fetching compliance summary:', error);
    res.status(500).json({ error: 'Failed to fetch compliance summary' });
  }
});

/**
 * Helper function to check a submission for compliance violations
 * Returns an array of violation objects
 */
function checkCompliance(submission) {
  const violations = [];
  const formData = submission.form_data;

  // Check based on template type
  if (submission.template_name.includes('Temperature')) {
    // Check temperature ranges
    const temp = parseFloat(formData.temperature);
    
    if (isNaN(temp)) {
      violations.push({
        issue: 'Missing temperature reading',
        details: { field: 'temperature', value: formData.temperature },
        corrective_action: formData.corrective_action || 'Not specified',
      });
    } else if (temp < 32 || temp > 40) {
      violations.push({
        issue: 'Temperature out of safe range',
        details: {
          field: formData.equipment_name || formData.food_item || 'Unknown item',
          temperature: temp,
          threshold: '32-40°F',
        },
        corrective_action: formData.corrective_action || 'Not specified',
      });
    }
  }

  if (submission.template_name.includes('Planogram')) {
    // Check if items are missing or issues reported
    if (formData.items_present === false) {
      violations.push({
        issue: 'Planogram items not present',
        details: {
          station: formData.station_name,
          issues: formData.issues_found || 'Not specified',
        },
        corrective_action: formData.notes || 'Not specified',
      });
    }
  }

  if (submission.template_name.includes('Sanitation')) {
    // Check if setup is incomplete or supplies missing
    if (formData.setup_complete === false) {
      violations.push({
        issue: 'Sanitation setup incomplete',
        details: {
          area: formData.area_name,
          supplies_missing: formData.supplies_needed || 'Not specified',
        },
        corrective_action: 'Complete setup and restock supplies',
      });
    }
  }

  if (submission.template_name.includes('Reimbursable')) {
    // Check if all required components are present
    const components = formData.components || {};
    const missingComponents = [];
    
    ['protein', 'grain', 'fruit', 'vegetable', 'milk'].forEach(component => {
      if (!components[component]) {
        missingComponents.push(component);
      }
    });

    if (missingComponents.length > 0) {
      violations.push({
        issue: 'Meal missing required components',
        details: {
          missing_components: missingComponents,
          students_served: formData.students_served,
        },
        corrective_action: 'Non-reimbursable - missing components',
      });
    }
  }

  return violations;
}

module.exports = router;
