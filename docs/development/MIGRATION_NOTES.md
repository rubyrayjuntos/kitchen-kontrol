Migration notes

- Added migration `migrations/002_normalize_log_status.js` to convert `log_status.log_id` to integer where numeric and `log_status.date` to DATE where parseable; creates an index on (log_id, date).
- Updated initial schema in `migrations/001_initial_schema.js` and runtime DDL in `database-setup.js` to store `log_status.log_id` as INTEGER and `log_status.date` as DATE and to reference `tasks(id)`.
- Applied conversion manually to the running Postgres container (used ALTER TABLE ... USING casts) to avoid downtime during development. To apply in CI or fresh DBs run:

  npm run migrate:up

  or with npx:

  npx node-pg-migrate up -d $DATABASE_URL

- Note: the migration makes a best-effort conversion: non-numeric `log_id` values are set to NULL and date values that don't match YYYY-MM-DD are set to NULL. Review data if you expect other formats.
