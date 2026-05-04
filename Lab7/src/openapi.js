export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Plant Care API',
    version: '0.1.0',
    description: 'JWT-protected CRUD API for the Lab 6 plant care tracker entities.',
  },
  servers: [
    {
      url: 'http://localhost:3007',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'JWT token issuing' },
    { name: 'Plants', description: 'Plant CRUD operations' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      TokenRequest: {
        type: 'object',
        properties: {
          role: {
            type: 'string',
            enum: ['ADMIN', 'WRITER', 'VISITOR'],
            example: 'ADMIN',
          },
          permissions: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['READ', 'WRITE', 'DELETE'],
            },
            example: ['READ', 'WRITE'],
          },
        },
      },
      TokenResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          tokenType: { type: 'string', example: 'Bearer' },
          expiresIn: { type: 'integer', example: 60 },
          role: { type: 'string', example: 'ADMIN' },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['READ', 'WRITE', 'DELETE'],
          },
        },
      },
      PlantInput: {
        type: 'object',
        required: ['name', 'species', 'room', 'wateringInterval'],
        properties: {
          name: { type: 'string', example: 'Nova' },
          species: { type: 'string', example: 'Monstera deliciosa' },
          room: { type: 'string', example: 'Living room' },
          light: {
            type: 'string',
            enum: ['Bright indirect', 'Filtered sun', 'Partial shade', 'Low light'],
            example: 'Bright indirect',
          },
          wateringInterval: { type: 'integer', minimum: 1, maximum: 60, example: 7 },
          lastWatered: { type: 'string', format: 'date', example: '2026-05-01' },
          health: { type: 'string', enum: ['thriving', 'steady', 'watch'], example: 'thriving' },
          favorite: { type: 'boolean', example: true },
          notes: { type: 'string', example: 'Rotate weekly.' },
        },
      },
      Plant: {
        allOf: [
          { $ref: '#/components/schemas/PlantInput' },
          {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'nova-monstera' },
              createdAt: { type: 'string', format: 'date', example: '2026-03-24' },
              history: {
                type: 'array',
                items: { type: 'string', format: 'date' },
                example: ['2026-04-17', '2026-04-24', '2026-05-01'],
              },
            },
          },
        ],
      },
      PlantResponse: {
        type: 'object',
        properties: {
          data: { $ref: '#/components/schemas/Plant' },
        },
      },
      PlantListResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Plant' },
          },
          pagination: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 3 },
              skip: { type: 'integer', example: 0 },
              limit: { type: 'integer', example: 20 },
              returned: { type: 'integer', example: 3 },
            },
          },
        },
      },
      PlantArrayResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Plant' },
          },
        },
      },
      PlantReplaceRequest: {
        type: 'object',
        required: ['plants'],
        properties: {
          plants: {
            type: 'array',
            items: { $ref: '#/components/schemas/Plant' },
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Plant not found' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Missing, invalid, or expired JWT',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      Forbidden: {
        description: 'JWT is valid but does not contain the required permission',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFound: {
        description: 'Entity not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Auth'],
        summary: 'Health check',
        responses: {
          200: { description: 'API is healthy' },
        },
      },
    },
    '/token': {
      post: {
        tags: ['Auth'],
        summary: 'Issue a JWT with a 1-minute expiration',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TokenRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'JWT issued',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TokenResponse' },
              },
            },
          },
          400: { description: 'Invalid permissions requested' },
        },
      },
    },
    '/api/plants': {
      get: {
        tags: ['Plants'],
        summary: 'List plants with pagination',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'skip', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'room', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Paginated plant list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PlantListResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Plants'],
        summary: 'Create a plant',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PlantInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Plant created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PlantResponse' },
              },
            },
          },
          400: { description: 'Validation error' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      put: {
        tags: ['Plants'],
        summary: 'Replace the plant collection from a backup',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PlantReplaceRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Plant collection replaced',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PlantArrayResponse' },
              },
            },
          },
          400: { description: 'Validation error' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/plants/{id}': {
      get: {
        tags: ['Plants'],
        summary: 'Read one plant',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Plant found', content: { 'application/json': { schema: { $ref: '#/components/schemas/PlantResponse' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Plants'],
        summary: 'Update one plant',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PlantInput' } } },
        },
        responses: {
          200: { description: 'Plant updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/PlantResponse' } } } },
          400: { description: 'Validation error' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Plants'],
        summary: 'Delete one plant',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Plant deleted' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/plants/{id}/water': {
      patch: {
        tags: ['Plants'],
        summary: 'Log watering for one plant',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Watering logged', content: { 'application/json': { schema: { $ref: '#/components/schemas/PlantResponse' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/plants/{id}/favorite': {
      patch: {
        tags: ['Plants'],
        summary: 'Toggle favorite for one plant',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Favorite toggled', content: { 'application/json': { schema: { $ref: '#/components/schemas/PlantResponse' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
  },
}
