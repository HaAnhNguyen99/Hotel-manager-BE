'use strict';

/**
 * service-usage service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::service-usage.service-usage');
