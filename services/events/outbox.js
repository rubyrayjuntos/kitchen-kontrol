const { randomUUID } = require('crypto');

/**
 * Enqueue a domain event into the transactional outbox.
 * Expects a PG client when invoked inside an open transaction.
 *
 * @param {import('pg').PoolClient} client - Active transaction client.
 * @param {Object} options
 * @param {string} options.eventType
 * @param {string} options.aggregateType
 * @param {string|number} options.aggregateId
 * @param {Object} [options.payload]
 * @param {string} [options.eventId]
 * @returns {Promise<string>} The event identifier persisted to the outbox table.
 */
async function enqueueEvent(client, { eventType, aggregateType, aggregateId, payload = {}, eventId = randomUUID() }) {
  if (!client || typeof client.query !== 'function') {
    throw new Error('enqueueEvent requires an active PG client with a query method.');
  }

  if (!eventType || !aggregateType || typeof aggregateId === 'undefined' || aggregateId === null) {
    throw new Error('eventType, aggregateType, and aggregateId are required when enqueuing an event.');
  }

  const text = `
    INSERT INTO outbox (event_id, aggregate_type, aggregate_id, event_type, payload)
    VALUES ($1, $2, $3, $4, $5::jsonb)
  `;

  const values = [
    eventId,
    String(aggregateType),
    String(aggregateId),
    String(eventType),
    JSON.stringify(payload)
  ];

  await client.query(text, values);

  return eventId;
}

module.exports = {
  enqueueEvent
};
