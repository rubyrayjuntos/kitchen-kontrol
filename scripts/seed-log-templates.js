/**
 * Seed Script: Log Templates
 * 
 * Converts the 5 existing hardcoded log forms from LogsView.js into JSON Schema format.
 * This is the bridge between "old way" (code) and "new way" (data).
 * 
 * Each template includes:
 * 1. form_schema: JSON Schema (validation, types, required fields)
 * 2. ui_schema: UI hints (widgets, layout, placeholders)
 * 3. Metadata: name, description, category, frequency
 * 
 * Templates:
 * 1. Equipment Temperatures (twice_daily) - Walk-in, Freezer, Milk Coolers, Warmers
 * 2. Food Temperatures (per_service) - Arrival, Pre-service, Mid-service checks
 * 3. Planograms (daily) - 5-zone cleaning verification
 * 4. Sanitation Setup (daily) - Hand wash, 3-comp sink, supplies
 * 5. Reimbursable Meals (per_meal) - USDA 5-component tracking
 */

const { Pool } = require('pg');

// Database connection (uses same config as db.js)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/kitchen_kontrol'
});

// ============================================================================
// TEMPLATE 1: Equipment Temperatures (Twice Daily)
// ============================================================================
const equipmentTempsTemplate = {
  name: 'Equipment Temperatures',
  description: 'Twice-daily temperature checks for refrigeration and warming equipment to ensure food safety compliance.',
  category: 'food_safety',
  frequency: 'twice_daily',
  form_schema: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "title": "Equipment Temperature Log",
    "description": "Record temperatures for all refrigeration and warming equipment. Safe ranges must be maintained at all times.",
    "required": ["check_time", "walk_in_fridge", "freezer", "milk_coolers", "warmers", "initials"],
    "properties": {
      "check_time": {
        "type": "string",
        "enum": ["morning", "afternoon"],
        "title": "Check Time",
        "description": "Morning check: 6:00 AM | Afternoon check: 2:00 PM"
      },
      "walk_in_fridge": {
        "type": "number",
        "title": "Walk-in Fridge Temperature (°F)",
        "minimum": 0,
        "maximum": 50,
        "description": "Safe range: 32-40°F. If out of range, document corrective action in notes."
      },
      "freezer": {
        "type": "number",
        "title": "Freezer Temperature (°F)",
        "minimum": -20,
        "maximum": 20,
        "description": "Safe range: 0-10°F. If out of range, document corrective action in notes."
      },
      "milk_coolers": {
        "type": "number",
        "title": "Milk Coolers Temperature (°F)",
        "minimum": 0,
        "maximum": 50,
        "description": "Safe range: 32-40°F. Check all coolers."
      },
      "warmers": {
        "type": "number",
        "title": "Warmers Temperature (°F)",
        "minimum": 100,
        "maximum": 200,
        "description": "Safe range: 135-165°F. Must hold hot food at safe temperature."
      },
      "notes": {
        "type": "string",
        "title": "Corrective Actions / Notes",
        "description": "Required if any temperature is out of safe range. Describe actions taken."
      },
      "initials": {
        "type": "string",
        "title": "Completed By (Initials)",
        "minLength": 2,
        "maxLength": 4,
        "description": "Your initials to confirm completion"
      }
    }
  },
  ui_schema: {
    "check_time": {
      "ui:widget": "radio",
      "ui:options": {
        "inline": true
      }
    },
    "walk_in_fridge": {
      "ui:placeholder": "e.g., 38"
    },
    "freezer": {
      "ui:placeholder": "e.g., 5"
    },
    "milk_coolers": {
      "ui:placeholder": "e.g., 37"
    },
    "warmers": {
      "ui:placeholder": "e.g., 145"
    },
    "notes": {
      "ui:widget": "textarea",
      "ui:options": {
        "rows": 3
      },
      "ui:placeholder": "Describe any corrective actions taken..."
    },
    "initials": {
      "ui:placeholder": "e.g., MJ",
      "ui:options": {
        "uppercase": true
      }
    },
    "ui:order": ["check_time", "walk_in_fridge", "freezer", "milk_coolers", "warmers", "notes", "initials"]
  }
};

// ============================================================================
// TEMPLATE 2: Food Temperatures (Per Service)
// ============================================================================
const foodTempsTemplate = {
  name: 'Food Temperatures',
  description: 'Temperature checks for cooked food items at arrival, pre-service, and mid-service to ensure safe holding temperatures.',
  category: 'food_safety',
  frequency: 'per_service',
  form_schema: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "title": "Food Temperature Log",
    "description": "Check temperatures of all cooked food items. Safe holding temperature is 135°F or above for hot foods.",
    "required": ["service_type", "check_point", "main_entree_temp", "main_entree_portions", "initials"],
    "properties": {
      "service_type": {
        "type": "string",
        "enum": ["breakfast", "lunch"],
        "title": "Service Type"
      },
      "check_point": {
        "type": "string",
        "enum": ["arrival", "pre_service", "mid_service"],
        "title": "Check Point",
        "description": "Arrival: When food delivered | Pre-service: Before serving | Mid-service: During meal"
      },
      "main_entree_temp": {
        "type": "number",
        "title": "Main Entree Temperature (°F)",
        "minimum": 0,
        "maximum": 250,
        "description": "Safe minimum: 135°F for hot foods, 41°F or below for cold foods"
      },
      "main_entree_portions": {
        "type": "integer",
        "title": "Main Entree Portions Available",
        "minimum": 0,
        "description": "Count of portions available at this check"
      },
      "side_dish_temp": {
        "type": "number",
        "title": "Side Dish Temperature (°F)",
        "minimum": 0,
        "maximum": 250
      },
      "side_dish_portions": {
        "type": "integer",
        "title": "Side Dish Portions Available",
        "minimum": 0
      },
      "vegetable_temp": {
        "type": "number",
        "title": "Vegetable Temperature (°F)",
        "minimum": 0,
        "maximum": 250
      },
      "vegetable_portions": {
        "type": "integer",
        "title": "Vegetable Portions Available",
        "minimum": 0
      },
      "waste_count": {
        "type": "integer",
        "title": "Items Discarded (if temp out of range)",
        "minimum": 0,
        "default": 0,
        "description": "Number of items discarded due to temperature violations"
      },
      "corrective_action": {
        "type": "string",
        "title": "Corrective Action (if needed)",
        "description": "Describe actions taken if temperatures were out of safe range"
      },
      "initials": {
        "type": "string",
        "title": "Completed By (Initials)",
        "minLength": 2,
        "maxLength": 4
      }
    }
  },
  ui_schema: {
    "service_type": {
      "ui:widget": "radio",
      "ui:options": {
        "inline": true
      }
    },
    "check_point": {
      "ui:widget": "radio"
    },
    "corrective_action": {
      "ui:widget": "textarea",
      "ui:options": {
        "rows": 2
      }
    },
    "ui:order": [
      "service_type",
      "check_point",
      "main_entree_temp",
      "main_entree_portions",
      "side_dish_temp",
      "side_dish_portions",
      "vegetable_temp",
      "vegetable_portions",
      "waste_count",
      "corrective_action",
      "initials"
    ]
  }
};

// ============================================================================
// TEMPLATE 3: Planograms (Daily Zone Cleaning)
// ============================================================================
const planogramsTemplate = {
  name: 'Planogram Cleaning Verification',
  description: 'Daily verification of cleaning completion for all kitchen zones. Each zone has an assigned cleaner.',
  category: 'operations',
  frequency: 'daily',
  form_schema: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "title": "Daily Planogram Cleaning Log",
    "description": "Verify that each zone has been properly cleaned and check off completion.",
    "required": ["zone_serving_line_complete", "zone_dish_pit_complete", "zone_foh_pos_complete", "zone_floors_complete", "zone_monitor_complete", "supervisor_initials"],
    "properties": {
      "zone_serving_line_complete": {
        "type": "boolean",
        "title": "Serving Line - Cleaned",
        "description": "Includes counters, sneeze guards, utensil holders, warmers",
        "default": false
      },
      "zone_serving_line_assignee": {
        "type": "string",
        "title": "Serving Line - Assigned To"
      },
      "zone_dish_pit_complete": {
        "type": "boolean",
        "title": "Dish Pit - Cleaned",
        "description": "Includes dishwasher, sinks, drying racks, floor mats",
        "default": false
      },
      "zone_dish_pit_assignee": {
        "type": "string",
        "title": "Dish Pit - Assigned To"
      },
      "zone_foh_pos_complete": {
        "type": "boolean",
        "title": "Front of House / POS - Cleaned",
        "description": "Includes registers, student tables, condiment stations",
        "default": false
      },
      "zone_foh_pos_assignee": {
        "type": "string",
        "title": "FOH/POS - Assigned To"
      },
      "zone_floors_complete": {
        "type": "boolean",
        "title": "Floors - Swept & Mopped",
        "description": "All kitchen and dining areas",
        "default": false
      },
      "zone_floors_assignee": {
        "type": "string",
        "title": "Floors - Assigned To"
      },
      "zone_monitor_complete": {
        "type": "boolean",
        "title": "Monitor Station - Cleaned",
        "description": "Includes point of service monitors, scales, milk coolers",
        "default": false
      },
      "zone_monitor_assignee": {
        "type": "string",
        "title": "Monitor Station - Assigned To"
      },
      "notes": {
        "type": "string",
        "title": "Additional Notes"
      },
      "supervisor_initials": {
        "type": "string",
        "title": "Supervisor Verification (Initials)",
        "minLength": 2,
        "maxLength": 4
      }
    }
  },
  ui_schema: {
    "zone_serving_line_assignee": {
      "ui:placeholder": "e.g., Maria J."
    },
    "zone_dish_pit_assignee": {
      "ui:placeholder": "e.g., John D."
    },
    "zone_foh_pos_assignee": {
      "ui:placeholder": "e.g., Sarah K."
    },
    "zone_floors_assignee": {
      "ui:placeholder": "e.g., Mike R."
    },
    "zone_monitor_assignee": {
      "ui:placeholder": "e.g., Lisa T."
    },
    "notes": {
      "ui:widget": "textarea",
      "ui:options": {
        "rows": 2
      }
    },
    "ui:order": [
      "zone_serving_line_complete",
      "zone_serving_line_assignee",
      "zone_dish_pit_complete",
      "zone_dish_pit_assignee",
      "zone_foh_pos_complete",
      "zone_foh_pos_assignee",
      "zone_floors_complete",
      "zone_floors_assignee",
      "zone_monitor_complete",
      "zone_monitor_assignee",
      "notes",
      "supervisor_initials"
    ]
  }
};

// ============================================================================
// TEMPLATE 4: Sanitation Setup (Daily)
// ============================================================================
const sanitationTemplate = {
  name: 'Sanitation Setup Verification',
  description: 'Daily verification that all sanitation stations are properly stocked and sanitizer levels are correct.',
  category: 'food_safety',
  frequency: 'daily',
  form_schema: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "title": "Daily Sanitation Setup Log",
    "description": "Verify that all hand wash stations and the 3-compartment sink are properly set up.",
    "required": ["hand_wash_1_soap", "hand_wash_1_towels", "hand_wash_2_soap", "hand_wash_2_towels", "three_comp_sink_soap", "three_comp_sink_sanitizer", "three_comp_sink_test_strips", "initials"],
    "properties": {
      "hand_wash_1_soap": {
        "type": "boolean",
        "title": "Hand Wash Station 1 - Soap",
        "default": false
      },
      "hand_wash_1_towels": {
        "type": "boolean",
        "title": "Hand Wash Station 1 - Paper Towels",
        "default": false
      },
      "hand_wash_2_soap": {
        "type": "boolean",
        "title": "Hand Wash Station 2 - Soap",
        "default": false
      },
      "hand_wash_2_towels": {
        "type": "boolean",
        "title": "Hand Wash Station 2 - Paper Towels",
        "default": false
      },
      "three_comp_sink_soap": {
        "type": "boolean",
        "title": "3-Compartment Sink - Dish Soap",
        "default": false
      },
      "three_comp_sink_sanitizer": {
        "type": "boolean",
        "title": "3-Compartment Sink - Sanitizer Solution",
        "default": false
      },
      "three_comp_sink_sanitizer_ppm": {
        "type": "number",
        "title": "Sanitizer Concentration (PPM)",
        "minimum": 0,
        "maximum": 400,
        "description": "Target range: 200-400 PPM for quaternary ammonium"
      },
      "three_comp_sink_test_strips": {
        "type": "boolean",
        "title": "3-Compartment Sink - Test Strips Available",
        "default": false
      },
      "notes": {
        "type": "string",
        "title": "Issues / Corrective Actions"
      },
      "initials": {
        "type": "string",
        "title": "Completed By (Initials)",
        "minLength": 2,
        "maxLength": 4
      }
    }
  },
  ui_schema: {
    "three_comp_sink_sanitizer_ppm": {
      "ui:placeholder": "Test with strip, e.g., 250"
    },
    "notes": {
      "ui:widget": "textarea",
      "ui:options": {
        "rows": 2
      }
    },
    "ui:order": [
      "hand_wash_1_soap",
      "hand_wash_1_towels",
      "hand_wash_2_soap",
      "hand_wash_2_towels",
      "three_comp_sink_soap",
      "three_comp_sink_sanitizer",
      "three_comp_sink_sanitizer_ppm",
      "three_comp_sink_test_strips",
      "notes",
      "initials"
    ]
  }
};

// ============================================================================
// TEMPLATE 5: Reimbursable Meals (Per Meal Period)
// ============================================================================
const reimbursableMealsTemplate = {
  name: 'Reimbursable Meals Count',
  description: 'USDA-compliant meal counting for reimbursement. Track planned vs served meals and verify 5-component requirements.',
  category: 'usda_compliance',
  frequency: 'per_meal',
  form_schema: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "title": "Reimbursable Meals Log",
    "description": "Count meals served and verify USDA 5-component requirements for reimbursement eligibility.",
    "required": ["meal_period", "planned_count", "served_count", "has_protein", "has_grain", "has_fruit", "has_vegetable", "has_milk", "recorder_initials"],
    "properties": {
      "meal_period": {
        "type": "string",
        "enum": ["breakfast", "lunch_period_1", "lunch_period_2", "lunch_period_3", "lunch_period_4"],
        "title": "Meal Period"
      },
      "planned_count": {
        "type": "integer",
        "title": "Planned Meal Count",
        "minimum": 0,
        "description": "Expected number of meals for this period"
      },
      "served_count": {
        "type": "integer",
        "title": "Actual Meals Served",
        "minimum": 0,
        "description": "Actual count of reimbursable meals served"
      },
      "waste_count": {
        "type": "integer",
        "title": "Meals Wasted",
        "minimum": 0,
        "default": 0,
        "description": "Meals prepared but not served"
      },
      "has_protein": {
        "type": "boolean",
        "title": "✓ Protein Component",
        "description": "Meat, beans, eggs, cheese, yogurt, or nut butter",
        "default": true
      },
      "has_grain": {
        "type": "boolean",
        "title": "✓ Grain Component",
        "description": "Bread, rice, pasta, tortilla, or cereal (whole grain preferred)",
        "default": true
      },
      "has_fruit": {
        "type": "boolean",
        "title": "✓ Fruit Component",
        "description": "Fresh, frozen, canned, or dried fruit",
        "default": true
      },
      "has_vegetable": {
        "type": "boolean",
        "title": "✓ Vegetable Component",
        "description": "Any vegetable (dark green, red/orange, beans/peas, starchy, or other)",
        "default": true
      },
      "has_milk": {
        "type": "boolean",
        "title": "✓ Milk Component",
        "description": "Unflavored low-fat (1%) or fat-free milk, or flavored fat-free milk",
        "default": true
      },
      "notes": {
        "type": "string",
        "title": "Notes / Issues"
      },
      "recorder_initials": {
        "type": "string",
        "title": "Recorded By (Initials)",
        "minLength": 2,
        "maxLength": 4
      }
    }
  },
  ui_schema: {
    "meal_period": {
      "ui:widget": "select"
    },
    "planned_count": {
      "ui:placeholder": "e.g., 350"
    },
    "served_count": {
      "ui:placeholder": "e.g., 342"
    },
    "notes": {
      "ui:widget": "textarea",
      "ui:options": {
        "rows": 2
      }
    },
    "ui:order": [
      "meal_period",
      "planned_count",
      "served_count",
      "waste_count",
      "has_protein",
      "has_grain",
      "has_fruit",
      "has_vegetable",
      "has_milk",
      "notes",
      "recorder_initials"
    ]
  }
};

// ============================================================================
// SEED FUNCTION
// ============================================================================
async function seedLogTemplates() {
  console.log('🌱 Starting log templates seed...');
  
  const templates = [
    equipmentTempsTemplate,
    foodTempsTemplate,
    planogramsTemplate,
    sanitationTemplate,
    reimbursableMealsTemplate
  ];
  
  try {
    for (const template of templates) {
      // Check if template already exists
      const existingResult = await pool.query(
        'SELECT id FROM log_templates WHERE name = $1',
        [template.name]
      );
      
      if (existingResult.rows.length > 0) {
        console.log(`⏭️  Skipping "${template.name}" - already exists`);
        continue;
      }
      
      // Insert template
      const result = await pool.query(
        `INSERT INTO log_templates 
          (name, description, category, frequency, form_schema, ui_schema)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name`,
        [
          template.name,
          template.description,
          template.category,
          template.frequency,
          JSON.stringify(template.form_schema),
          JSON.stringify(template.ui_schema)
        ]
      );
      
      console.log(`✅ Created template: "${result.rows[0].name}" (ID: ${result.rows[0].id})`);
    }
    
    console.log('🎉 Seed complete! All 5 log templates created.');
    console.log('');
    console.log('📋 Templates created:');
    console.log('   1. Equipment Temperatures (twice_daily)');
    console.log('   2. Food Temperatures (per_service)');
    console.log('   3. Planogram Cleaning Verification (daily)');
    console.log('   4. Sanitation Setup Verification (daily)');
    console.log('   5. Reimbursable Meals Count (per_meal)');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Create sample assignments: npm run seed-assignments');
    console.log('   2. Build API endpoints: routes/log-*.js');
    console.log('   3. Create FormRenderer component');
    
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedLogTemplates()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedLogTemplates };
