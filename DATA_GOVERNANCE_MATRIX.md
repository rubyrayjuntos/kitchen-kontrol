# Data Lifecycle Governance Matrix

This document is the canonical reference for entity lifecycle rules. It describes the human-readable policy and supplies a machine-friendly schema that automation, tests, and migrations can consume. Keep both sections in sync whenever business rules evolve.

---

## 1. Narrative Overview

- **Guiding principles**
  - Preserve history by default (soft deletes + lifecycle states).
  - Give operators explicit choices before destructive-looking actions (preflight dependency checks).
  - Execute state changes inside transactional command scripts so reassignment, audit logging, and placeholder updates succeed or fail together.
  - Surface any residual inconsistencies in steward queues; treat them as exceptions with SLA-driven follow-up, not primary flow.

- **Placeholder records**
  - `roles`: `role_id = 'tba-role'` ("To Be Assigned")
  - `users`: `user_id = NULL` is never acceptable; instead mark users inactive. No placeholder user exists.
  - `phases`: `phase_id = 'tba-phase'` if a phase must be reassigned.
  - `tasks`: move to `tba-role` and flag as `status = 'unassigned'`.
  - Additional placeholders may be introduced; record them in Section 3.

- **Automation hooks**
  - Each entity action should log to `audit_log` with the originating user, action verb, entity id, and strategy chosen (e.g., `archive_with_reassignment`).
  - Preflight endpoints return both a human summary and the JSON structure from Section 3 to keep UI and backend aligned.

### 1.1 Architectural Research Alignment

- **Soft delete critique**: Follow timestamp-based soft deletes paired with lifecycle states; rely on sentinel "ghost" rows where relationships must remain NOT NULL instead of permissive NULL foreign keys.
- **Historical storage escalation path**: For domains needing richer replay than soft delete provides, adopt archive (dual-table) or temporal history models; document chosen strategy per entity before implementation.
- **Event-driven cascades**: Use transactional outbox + asynchronous consumers so role/user phase transitions publish events that drive dependent updates, archival copies, and audit entries without long-lived user transactions.
- **Idempotent remediation**: Consumers must use event ids for dedupe and bulk SQL for reassignment to stay idempotent under at-least-once delivery and to keep steward queues exceptional.
- **Performance hygiene**: Maintain filtered indexes on active states, monitor outbox/queue depth, and schedule archival jobs so soft-deleted rows never starve operational queries.

## 2. Entity-by-Entity Matrix (Human Readable)

| Entity | Critical Relations | Allowed States | Primary Pattern(s) | Preflight Options | Transactional Responsibilities | Stewardship Triggers |
| --- | --- | --- | --- | --- | --- | --- |
| `users` | `user_roles.user_id`, `log_assignments.user_id`, `log_assignments.assigned_by`, `log_submissions.submitted_by`, `absences.user_id`, `audit_log.user_id`, `training_modules.created_by`, `user_progress.user_id` | `active`, `suspended`, `inactive`, `archived` | Lifecycle state machine, soft delete (`deleted_at`), event/audit trail | `reassign duties`, `convert to archived`, `cancel` | Ensure no active duties remain; reassign `user_roles` and `log_assignments` to placeholder role or peer; lock authentication; append audit | Any submission referencing suspended user without reassignment; tasks left in queue > SLA |
| `roles` | `tasks.role_id`, `user_roles.role_id`, `role_phases.role_id`, `log_assignments.role_id` | `active`, `deprecated`, `archived` | Lifecycle, soft delete, placeholder reassignment, preflight dependency check | `reassign to role`, `move to placeholder`, `cancel` | Move dependents to selected role; update tasks to `status='unassigned'` when moved to placeholder; archive role; log action | Placeholder backlog grows beyond threshold; role archived but still primary in assignments |
| `phases` | `role_phases.phase_id`, `log_assignments.phase_id` | `planned`, `active`, `retired` | Lifecycle, soft delete, preflight | `reassign phase`, `retire only`, `cancel` | Reassign impacted roles/assignments; update schedules; log change | Assignments tied to retired phase |
| `tasks` | `log_status.log_id` (FK), `roles.role_id` | `active`, `paused`, `retired`, `archived`, `unassigned` | Lifecycle, placeholder role, preflight | `reassign role`, `flag unassigned`, `cancel` | Update role linkage, flag status, cascade schedule updates, audit entry | `unassigned` tasks older than SLA |
| `log_templates` | `log_assignments.log_template_id`, `log_submissions.log_template_id` | `draft`, `active`, `retired` | Event sourcing/versioning, lifecycle | `retire template`, `clone new version`, `cancel` | Create new version on edits; mark old version retired; ensure assignments reference proper version; audit | Active assignments referencing retired template |
| `log_assignments` | `log_submissions.log_assignment_id`, `users`, `roles`, `phases` | `scheduled`, `paused`, `archived` | Lifecycle, transactional reassignment | `pause`, `archive`, `transfer ownership`, `cancel` | Update downstream notifications, keep submission history intact, audit | Submissions arriving for archived assignment |
| `log_submissions` | `users`, `log_templates`, `log_assignments` | `completed`, `flagged`, `corrected`, `overdue` | Immutable event trail | `flag`, `correct`, `append note` | Append-only updates (no delete); maintain correction chain; audit | Flagged submissions unresolved |
| `audit_log` | `users.user_id` | `immutable` | Event sourcing | N/A | Append-only | N/A |
| `absences` | `users.user_id`, workflow approvals | `pending`, `approved`, `denied`, `archived` | Lifecycle | `approve`, `deny`, `archive`, `cancel` | Maintain approval history; never delete; audit | Pending beyond SLA |
| `training_modules` | `log_assignments` (future), `user_progress` | `draft`, `active`, `retired` | Lifecycle, versioning | `publish new version`, `retire`, `cancel` | Clone content for revisions; preserve learner progress; audit | Learners on retired modules |
| `user_progress` | `users`, `training_modules` | `not_started`, `in_progress`, `completed`, `archived` | Lifecycle | N/A | Update state only; never delete; audit if forced reset | Progress rows tied to archived module |
| `planograms` & `planogram_wells` | Internal scheduling | `draft`, `scheduled`, `executed`, `archived` | Lifecycle, event history | `archive`, `clone`, `cancel` | Preserve snapshots; append versioning | Archived planograms without successor |
| `ingredients` | Inventory integrations | `active`, `inactive` | Lifecycle | `inactivate`, `reactivate`, `cancel` | Maintain stock history; audit | Inactive ingredient still used in plan |

### Edge-Case Notes

- **Concurrent operations**: All mutation commands must acquire a row-level lock (`FOR UPDATE`) on the master entity before applying transitions to avoid conflicting reassignments.
- **System placeholders**: Prevent UI from editing or archiving placeholder records. Ensure migrations insert placeholders idempotently.
- **Historical queries**: Reporting queries should always filter on state field rather than existence (e.g., include archived roles to preserve timeline fidelity).
- **Compliance exports**: When legal removal is required, process via special compliance scripts that both purge data and snapshot context externally.

## 3. Machine-Readable Matrix (YAML)

```yaml
entities:
  users:
    table: users
    id_column: id
    states: [active, suspended, inactive, archived]
    soft_delete_column: deleted_at
    patterns: [lifecycle_state_machine, soft_delete, event_trail]
    placeholders: none
    dependents:
      - { table: user_roles, column: user_id, on_delete: reassign }
      - { table: log_assignments, column: user_id, on_delete: reassign }
      - { table: log_assignments, column: assigned_by, on_delete: reassign }
      - { table: log_submissions, column: submitted_by, on_delete: preserve }
      - { table: absences, column: user_id, on_delete: preserve }
      - { table: audit_log, column: user_id, on_delete: preserve }
      - { table: training_modules, column: created_by, on_delete: preserve }
      - { table: user_progress, column: user_id, on_delete: preserve }
    preflight_options: [reassign_duties, archive_user, cancel]
    transaction_actions: [reassign_user_roles, update_assignments, lock_auth, append_audit]
    steward_queue_trigger: { condition: orphaned_tasks, sla_hours: 24 }

  roles:
    table: roles
    id_column: id
    states: [active, deprecated, archived]
    soft_delete_column: deleted_at
    patterns: [lifecycle_state_machine, soft_delete, placeholder_reassignment, preflight]
    placeholders: { id: tba-role, description: "To Be Assigned" }
    dependents:
      - { table: tasks, column: role_id, on_delete: reassign_or_placeholder }
      - { table: user_roles, column: role_id, on_delete: reassign }
      - { table: role_phases, column: role_id, on_delete: reassign }
      - { table: log_assignments, column: role_id, on_delete: reassign }
    preflight_options: [reassign_to_role, move_to_placeholder, cancel]
    transaction_actions: [validate_placeholder_exists, migrate_dependents, mark_archived, append_audit]
    steward_queue_trigger: { condition: placeholder_backlog_gt, threshold: 10 }

  phases:
    table: phases
    id_column: id
    states: [planned, active, retired]
    soft_delete_column: retired_at
    patterns: [lifecycle_state_machine, soft_delete, preflight]
    placeholders: { id: tba-phase, description: "Unassigned Phase" }
    dependents:
      - { table: role_phases, column: phase_id, on_delete: reassign }
      - { table: log_assignments, column: phase_id, on_delete: reassign }
    preflight_options: [reassign_phase, retire_only, cancel]
    transaction_actions: [collect_dependents, migrate_or_placeholder, mark_retired, append_audit]
    steward_queue_trigger: { condition: assignments_pointing_to_retired, sla_hours: 24 }

  tasks:
    table: tasks
    id_column: id
    states: [active, paused, retired, archived, unassigned]
    soft_delete_column: archived_at
    patterns: [lifecycle_state_machine, placeholder_reassignment, preflight]
    placeholders: { role_id: tba-role }
    dependents:
      - { table: log_status, column: log_id, on_delete: preserve }
    preflight_options: [reassign_role, flag_unassigned, cancel]
    transaction_actions: [update_role_link, set_status, append_audit]
    steward_queue_trigger: { condition: status_unassigned_duration_gt, hours: 48 }

  log_templates:
    table: log_templates
    id_column: id
    states: [draft, active, retired]
    patterns: [event_sourcing, versioning, lifecycle_state_machine]
    dependents:
      - { table: log_assignments, column: log_template_id, on_delete: prevent }
      - { table: log_submissions, column: log_template_id, on_delete: prevent }
    preflight_options: [retire_template, clone_new_version, cancel]
    transaction_actions: [create_new_version, mark_old_retired, append_audit]
    steward_queue_trigger: { condition: assignments_on_retired_template, sla_hours: 12 }

  log_assignments:
    table: log_assignments
    id_column: id
    states: [scheduled, paused, archived]
    patterns: [lifecycle_state_machine, transactional_command]
    dependents:
      - { table: log_submissions, column: log_assignment_id, on_delete: preserve }
    preflight_options: [pause, archive, transfer_ownership, cancel]
    transaction_actions: [reassign_target, update_notifications, append_audit]
    steward_queue_trigger: { condition: submissions_for_archived, sla_hours: 6 }

  log_submissions:
    table: log_submissions
    id_column: id
    states: [completed, flagged, corrected, overdue]
    patterns: [event_sourcing, append_only]
    dependents: []
    preflight_options: [flag, correct, append_note]
    transaction_actions: [append_amendment, audit_change]
    steward_queue_trigger: { condition: flagged_unresolved_hours, hours: 24 }

  absences:
    table: absences
    id_column: id
    states: [pending, approved, denied, archived]
    patterns: [lifecycle_state_machine]
    dependents: []
    preflight_options: [approve, deny, archive, cancel]
    transaction_actions: [update_status, log_approval]
    steward_queue_trigger: { condition: pending_duration_gt, hours: 48 }

  training_modules:
    table: training_modules
    id_column: id
    states: [draft, active, retired]
    patterns: [lifecycle_state_machine, versioning]
    dependents:
      - { table: user_progress, column: module_id, on_delete: preserve }
    preflight_options: [publish_new_version, retire, cancel]
    transaction_actions: [clone_module, update_progress_state, append_audit]
    steward_queue_trigger: { condition: learners_on_retired, sla_hours: 24 }

  user_progress:
    table: user_progress
    id_column: id
    states: [not_started, in_progress, completed, archived]
    patterns: [lifecycle_state_machine]
    dependents: []
    preflight_options: []
    transaction_actions: [update_state, audit_change]
    steward_queue_trigger: { condition: dangling_progress_after_archive, sla_hours: 24 }

  planograms:
    table: planograms
    id_column: id
    states: [draft, scheduled, executed, archived]
    patterns: [lifecycle_state_machine, event_trail]
    dependents:
      - { table: planogram_wells, column: planogram_id, on_delete: cascade_within_transaction }
    preflight_options: [archive, clone, cancel]
    transaction_actions: [snapshot_current, update_state, append_audit]
    steward_queue_trigger: { condition: archived_without_clone, sla_hours: 24 }

  ingredients:
    table: ingredients
    id_column: id
    states: [active, inactive]
    patterns: [lifecycle_state_machine]
    dependents: []
    preflight_options: [inactivate, reactivate, cancel]
    transaction_actions: [update_state, audit_change]
    steward_queue_trigger: { condition: inactive_but_in_use, sla_hours: 12 }

placeholders:
  roles:
    id: tba-role
    name: "To Be Assigned"
    description: "System-managed role capturing orphaned tasks and assignments"
  phases:
    id: tba-phase
    title: "Unassigned Phase"
    description: "Placeholder phase used during reassignment workflows"

compliance:
  hard_delete_process: "Run compliance purge script with legal approval; snapshot context before delete"
  audit_log_required_fields: [user_id, action, entity, entity_id, strategy, timestamp]
  default_transaction_isolation: repeatable_read
  lock_timeout_ms: 5000
```

---

## 4. Maintenance Checklist

1. Update this matrix before shipping schema or API changes that affect lifecycle behavior.
2. Regenerate automated rule validators/tests from the YAML definition (script TBD).
3. Review steward queues weekly; adjust thresholds in Section 3 as operational maturity improves.
4. Ensure migrations insert/update placeholder records idempotently.

*Last updated: 2025-10-16*
