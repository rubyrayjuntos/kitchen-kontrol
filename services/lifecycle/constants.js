const ROLE_STATUSES = Object.freeze({
  ACTIVE: 'active',
  DEPRECATED: 'deprecated',
  ARCHIVED: 'archived'
});

const USER_STATUSES = Object.freeze({
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived'
});

const TASK_STATUSES = Object.freeze({
  ACTIVE: 'active',
  PAUSED: 'paused',
  RETIRED: 'retired',
  ARCHIVED: 'archived',
  UNASSIGNED: 'unassigned'
});

const PLACEHOLDER_ROLE_ID = 'tba-role';
const PLACEHOLDER_ROLE_NAME = 'To Be Assigned';
const PLACEHOLDER_PHASE_ID = 'tba-phase';
const PLACEHOLDER_PHASE_TITLE = 'Unassigned Phase';

module.exports = {
  ROLE_STATUSES,
  USER_STATUSES,
  TASK_STATUSES,
  PLACEHOLDER_ROLE_ID,
  PLACEHOLDER_ROLE_NAME,
  PLACEHOLDER_PHASE_ID,
  PLACEHOLDER_PHASE_TITLE
};
