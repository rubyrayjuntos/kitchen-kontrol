const { logger } = require('../../../middleware/logger');
const { PLACEHOLDER_ROLE_ID } = require('../../lifecycle/constants');

/**
 * Handler for RoleArchived events. This is presently a reporting hook that
 * confirms downstream automation ran. Future iterations can move expensive
 * cascades out of the request path and into this handler.
 *
 * @param {Object} options
 * @param {string} options.eventId
 * @param {string} options.aggregateId
 * @param {Object} options.payload
 * @returns {Promise<void>}
 */
async function handleRoleArchived({ eventId, aggregateId, payload }) {
  logger.info('Processed RoleArchived event', {
    eventId,
    roleId: aggregateId,
    placeholderRoleId: PLACEHOLDER_ROLE_ID,
    payload
  });
}

module.exports = handleRoleArchived;
