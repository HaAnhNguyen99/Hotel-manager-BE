'use strict';

/**
 * safety-and-hygiene service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::safety-and-hygiene.safety-and-hygiene');
