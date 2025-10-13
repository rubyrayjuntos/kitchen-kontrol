/* eslint-disable camelcase */

exports.up = (pgm) => {
  // Convert log_id from text to integer where possible, otherwise set NULL
  pgm.sql(`
    ALTER TABLE log_status
    ALTER COLUMN log_id TYPE integer USING (
      CASE
        WHEN log_id ~ '^[0-9]+$' THEN log_id::integer
        ELSE NULL
      END
    );
  `);

  // Convert date text to proper DATE type where possible; invalid parse -> NULL
  pgm.sql(`
    ALTER TABLE log_status
    ALTER COLUMN date TYPE date USING (
      CASE
        WHEN (date::text) ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN (date::text)::date
        ELSE NULL
      END
    );
  `);

  // Optionally add an index to speed lookups by log_id and date
  pgm.createIndex('log_status', ['log_id', 'date']);
};

exports.down = (pgm) => {
  pgm.dropIndex('log_status', ['log_id', 'date']);

  // Revert date to text
  pgm.sql(`ALTER TABLE log_status ALTER COLUMN date TYPE text USING (date::text);`);

  // Revert log_id to text
  pgm.sql(`ALTER TABLE log_status ALTER COLUMN log_id TYPE text USING (log_id::text);`);
};
