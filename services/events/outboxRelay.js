const db = require('../../db');
const { logger } = require('../../middleware/logger');
const handleRoleArchived = require('./handlers/roleArchived');

const DEFAULT_POLL_INTERVAL_MS = Number(process.env.OUTBOX_POLL_INTERVAL_MS || 5000);
const DEFAULT_BATCH_SIZE = Number(process.env.OUTBOX_BATCH_SIZE || 20);

const handlers = {
  RoleArchived: handleRoleArchived
};

let pollTimer = null;
let processing = false;

async function processOutboxBatch(batchSize) {
  if (!db._pool) {
    return;
  }

  const client = await db._pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT event_id, aggregate_type, aggregate_id, event_type, payload, created_at
       FROM outbox
       WHERE processed_at IS NULL
       ORDER BY created_at ASC
       FOR UPDATE SKIP LOCKED
       LIMIT $1`,
      [batchSize]
    );

    for (const row of rows) {
      const handler = handlers[row.event_type];

      try {
        if (handler) {
          await handler({
            eventId: row.event_id,
            aggregateType: row.aggregate_type,
            aggregateId: row.aggregate_id,
            payload: row.payload,
            createdAt: row.created_at
          });
        } else {
          logger.warn('No outbox handler registered for event type', { eventType: row.event_type, eventId: row.event_id });
        }

        await client.query('UPDATE outbox SET processed_at = NOW() WHERE event_id = $1', [row.event_id]);
      } catch (handlerErr) {
        logger.error('Failed to handle outbox event', {
          eventId: row.event_id,
          eventType: row.event_type,
          error: handlerErr.message
        });
        throw handlerErr;
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    if (err && err.message) {
      logger.error('Outbox relay batch aborted', { error: err.message });
    } else {
      logger.error('Outbox relay batch aborted', err);
    }
  } finally {
    client.release();
  }
}

async function tick(batchSize) {
  if (processing) {
    return;
  }
  processing = true;
  try {
    await processOutboxBatch(batchSize);
  } finally {
    processing = false;
  }
}

function startOutboxRelay({ pollIntervalMs = DEFAULT_POLL_INTERVAL_MS, batchSize = DEFAULT_BATCH_SIZE } = {}) {
  if (!db._pool) {
    logger.warn('Outbox relay disabled: Postgres pool unavailable.');
    return;
  }

  if (pollTimer) {
    return;
  }

  pollTimer = setInterval(() => {
    tick(batchSize).catch((err) => {
      logger.error('Outbox relay tick failed', { error: err.message });
    });
  }, pollIntervalMs);

  if (typeof pollTimer.unref === 'function') {
    pollTimer.unref();
  }

  logger.info('Outbox relay started', { pollIntervalMs, batchSize });

  tick(batchSize).catch((err) => {
    logger.error('Initial outbox relay tick failed', { error: err.message });
  });
}

function stopOutboxRelay() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
    logger.info('Outbox relay stopped');
  }
}

module.exports = {
  startOutboxRelay,
  stopOutboxRelay
};
