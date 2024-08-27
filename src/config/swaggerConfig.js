// config/swaggerConfig.js
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./config');
const path = require('path');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      description: 'API documentation for the Task Management System',
      version: '1.0.0',
    },
    servers: [
      {
        url: `http://localhost:${config.getPort()}`,
        description: 'Local server',
      },
    ],
  },
  apis: [path.join(__dirname, '../docs/openApi.js')], // Path to your API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(swaggerSpec),
};
