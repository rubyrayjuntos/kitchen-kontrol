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
  WHERE la.created_at::date >= $1::date AND la.created_at::date <= $2::date
        GROUP BY la.log_template_id, lt.name, lt.category
      ),
      submission_counts AS (
        -- Count completed submissions per template
        SELECT 
          ls.log_template_id as template_id,
          COUNT(DISTINCT ls.id) as completed_count
        FROM log_submissions ls
  WHERE ls.submission_date >= $1::date AND ls.submission_date <= $2::date
        GROUP BY ls.log_template_id
      )
      SELECT 
        ac.template_id,
        ac.template_name,
        ac.category,
        ac.total_assignments,
        COALESCE(sc.completed_count, 0) as completed,
        GREATEST(ac.total_assignments - COALESCE(sc.completed_count, 0), 0) as pending,
        CASE 
          WHEN ac.total_assignments > 0 
          THEN ROUND((LEAST(COALESCE(sc.completed_count, 0)::numeric, ac.total_assignments::numeric) / ac.total_assignments::numeric) * 100, 1)
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

    // Get the reimbursable-meals template ID (support legacy naming)
    const templateResult = await db.query(
      `SELECT id 
       FROM log_templates 
       WHERE LOWER(name) IN (
         'reimbursable meals count', 
         'reimbursable meals', 
         'reimbursable meals log'
       )
       ORDER BY id DESC
       LIMIT 1`
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reimbursable meals template not found' });
    }

    const templateId = templateResult.rows[0].id;

    // Query to get reimbursable meals data
    const query = `
      SELECT 
        ls.submission_date as date,
        COUNT(*) as submissions,
        SUM(COALESCE((ls.form_data->>'served_count')::integer, 0)) as served_meals,
        SUM(COALESCE((ls.form_data->>'planned_count')::integer, 0)) as planned_meals,
        SUM(
          CASE 
            WHEN 
              COALESCE((ls.form_data->>'has_protein')::boolean, false) AND
              COALESCE((ls.form_data->>'has_grain')::boolean, false) AND
              COALESCE((ls.form_data->>'has_fruit')::boolean, false) AND
              COALESCE((ls.form_data->>'has_vegetable')::boolean, false) AND
              COALESCE((ls.form_data->>'has_milk')::boolean, false)
            THEN COALESCE((ls.form_data->>'served_count')::integer, 0)
            ELSE 0
          END
        ) as compliant_meals
      FROM log_submissions ls
      WHERE ls.log_template_id = $1
        AND ls.submission_date >= $2
        AND ls.submission_date <= $3
      GROUP BY ls.submission_date
      ORDER BY date;
    `;

    const result = await db.query(query, [templateId, startDate, endDate]);

    // Calculate summary statistics
    const reimbursementRate = 3.50; // $3.50 per compliant meal (could come from configuration)

    const totalCompliantMeals = result.rows.reduce((sum, row) => sum + parseInt(row.compliant_meals || 0, 10), 0);
    const totalServedMeals = result.rows.reduce((sum, row) => sum + parseInt(row.served_meals || 0, 10), 0);
    const totalPlannedMeals = result.rows.reduce((sum, row) => sum + parseInt(row.planned_meals || 0, 10), 0);
    const nonCompliantMeals = Math.max(totalServedMeals - totalCompliantMeals, 0);
    const totalRevenue = totalCompliantMeals * reimbursementRate;
    const daysCount = result.rows.length || 1;
    const avgMealsPerDay = daysCount > 0 ? totalCompliantMeals / daysCount : 0;

    // Build daily breakdown with revenue details
    const dailyBreakdown = result.rows.map(row => {
      const compliantMeals = parseInt(row.compliant_meals || 0, 10);
      const servedMeals = parseInt(row.served_meals || 0, 10);
      const plannedMeals = parseInt(row.planned_meals || 0, 10);
      const revenue = parseFloat((compliantMeals * reimbursementRate).toFixed(2));

      return {
        date: row.date,
        meals: compliantMeals,
        compliant_meals: compliantMeals,
        non_compliant_meals: Math.max(servedMeals - compliantMeals, 0),
        served_meals: servedMeals,
        planned_meals: plannedMeals,
        revenue,
        submissions: parseInt(row.submissions || 0, 10),
      };
    });

    res.json({
      date_range: {
        start: startDate,
        end: endDate,
      },
      summary: {
        total_meals: totalCompliantMeals,
        total_served_meals: totalServedMeals,
        total_planned_meals: totalPlannedMeals,
        non_compliant_meals: nonCompliantMeals,
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
  lt.form_schema,
        u.name as user_name
      FROM log_submissions ls
      JOIN log_templates lt ON ls.log_template_id = lt.id
      JOIN users u ON ls.submitted_by = u.id
  WHERE ls.submitted_at::date >= $1::date AND ls.submitted_at::date <= $2::date
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
  const formData = submission.form_data || {};

  // Check based on template type
  if (submission.template_name === 'Equipment Temperatures') {
    // Check each equipment reading against safe ranges
    const thresholds = [
      { field: 'walk_in_fridge', min: 32, max: 40, label: 'Walk-in Fridge' },
      { field: 'freezer', min: -10, max: 10, label: 'Freezer' },
      { field: 'milk_coolers', min: 32, max: 40, label: 'Milk Coolers' },
      { field: 'warmers', min: 135, max: 165, label: 'Warmers' },
    ];

    thresholds.forEach(({ field, min, max, label }) => {
      const value = formData[field];
      if (value === undefined || value === null || value === '') {
        violations.push({
          issue: 'Missing temperature reading',
          details: { equipment: label, field },
          corrective_action: formData.notes || 'Not specified',
        });
        return;
      }

      const numericValue = parseFloat(value);
      if (isNaN(numericValue) || numericValue < min || numericValue > max) {
        violations.push({
          issue: 'Temperature out of safe range',
          details: { equipment: label, temperature: numericValue, threshold: `${min}-${max}°F` },
          corrective_action: formData.notes || 'Not specified',
        });
      }
    });
  }

  if (submission.template_name === 'Food Temperatures') {
    const checkpoints = [
      { field: 'main_entree_temp', label: 'Main Entree' },
      { field: 'side_dish_temp', label: 'Side Dish' },
      { field: 'vegetable_temp', label: 'Vegetable' },
    ];

    checkpoints.forEach(({ field, label }) => {
      if (formData[field] === undefined || formData[field] === null || formData[field] === '') {
        return;
      }

      const value = parseFloat(formData[field]);
      if (isNaN(value)) {
        violations.push({
          issue: 'Invalid temperature reading',
          details: { item: label, value: formData[field] },
          corrective_action: formData.corrective_action || 'Not specified',
        });
        return;
      }

      if (value < 135) {
        violations.push({
          issue: 'Hot holding below 135°F',
          details: { item: label, temperature: value },
          corrective_action: formData.corrective_action || 'Not specified',
        });
      }
    });
  }

  if (submission.template_name === 'Planogram Cleaning Verification') {
    const zones = [
      'zone_serving_line_complete',
      'zone_dish_pit_complete',
      'zone_foh_pos_complete',
      'zone_floors_complete',
      'zone_monitor_complete'
    ];

    zones.forEach(zoneField => {
      if (formData[zoneField] === false) {
        violations.push({
          issue: 'Planogram zone incomplete',
          details: { zone: zoneField, assignee: formData[zoneField.replace('_complete', '_assignee')] || 'Unassigned' },
          corrective_action: formData.notes || 'Follow up with assignee',
        });
      }
    });
  }

  if (submission.template_name === 'Sanitation Setup Verification') {
    const sanitationFields = [
      'hand_wash_1_soap',
      'hand_wash_1_towels',
      'hand_wash_2_soap',
      'hand_wash_2_towels',
      'three_comp_sink_soap',
      'three_comp_sink_sanitizer',
      'three_comp_sink_test_strips'
    ];

    sanitationFields.forEach(field => {
      if (formData[field] === false) {
        violations.push({
          issue: 'Sanitation requirement not met',
          details: { field },
          corrective_action: formData.notes || 'Restock and verify',
        });
      }
    });

    const sanitizerPpm = formData.three_comp_sink_sanitizer_ppm;
    if (sanitizerPpm !== undefined && sanitizerPpm !== null && sanitizerPpm !== '') {
      const ppmValue = parseFloat(sanitizerPpm);
      if (isNaN(ppmValue) || ppmValue < 200 || ppmValue > 400) {
        violations.push({
          issue: 'Sanitizer concentration out of range',
          details: { field: 'three_comp_sink_sanitizer_ppm', value: ppmValue, threshold: '200-400 PPM' },
          corrective_action: formData.notes || 'Adjust sanitizer concentration',
        });
      }
    }
  }

  if (submission.template_name === 'Reimbursable Meals Count') {
    const components = [
      { field: 'has_protein', label: 'Protein' },
      { field: 'has_grain', label: 'Grain' },
      { field: 'has_fruit', label: 'Fruit' },
      { field: 'has_vegetable', label: 'Vegetable' },
      { field: 'has_milk', label: 'Milk' },
    ];

    const missingComponents = components
      .filter(component => formData[component.field] === false)
      .map(component => component.label);

    if (missingComponents.length > 0) {
      violations.push({
        issue: 'Meal missing required components',
        details: {
          missing_components: missingComponents,
          meal_period: formData.meal_period,
          served_count: formData.served_count,
        },
        corrective_action: 'Non-reimbursable - missing components',
      });
    }
  }

  return violations;
}

module.exports = router;
