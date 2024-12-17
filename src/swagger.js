const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'URL Shortener API',
    version: '1.0.0',
    description: 'API documentation for URL shortener service',
  },
  servers: [
    {
      url: 'http://localhost:4001',
      description: 'Local server',
    },
  ],
  paths: {
    '/google-signin': {
      post: {
        summary: 'Google Sign-In',
        description: 'Sign in a user using Google OAuth token.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: {
                    type: 'string',
                    description: 'Google OAuth token',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Google Sign-In successful.',
                    },
                    user: {
                      type: 'object',
                      properties: {
                        email: {
                          type: 'string',
                          example: 'user@example.com',
                        },
                        googleId: {
                          type: 'string',
                          example: '3553bbj 356',
                        },
                        createdAt: {
                          type: 'string',
                          example: '2024-12-16T18:30:00.000Z',
                        },
                      },
                    }
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation errors',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    errors: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          msg: {
                            type: 'string',
                            example: 'Google token is required',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Invalid Google token',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Unauthorized access. Invalid token provided.',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/': {
      post: {
        summary: 'Shorten URL',
        description: 'Generate a shortened URL for a given long URL.',
        tags: ['URL Shortener'],
        security: [
          {
            BearerAuth: [], // For token-based authentication
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  longUrl: {
                    type: 'string',
                    description: 'The URL to be shortened.',
                    example: 'https://example.com/some/very/long/url',
                  },
                  topic: {
                    type: 'string',
                    description: 'Optional topic for categorization.',
                    example: 'marketing',
                  },
                },
                required: ['longUrl'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'URL shortened successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    alias: {
                      type: 'string',
                      example: 'abc123',
                    },
                    shortUrl: {
                      type: 'string',
                      example: 'http://short.ly/abc123',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error.',
          },
          401: {
            description: 'Authentication error.',
          },
        },
      },
    },
    '/{alias}': {
      get: {
        summary: 'Resolve URL',
        description: 'Redirect to the original URL based on the alias.',
        tags: ['URL Shortener'],
        parameters: [
          {
            name: 'alias',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              example: 'abc123',
            },
            description: 'The alias for the shortened URL.',
          },
        ],
        responses: {
          302: {
            description: 'Redirected to the original URL.',
          },
          404: {
            description: 'Alias not found.',
          },
        },
      },
    },
    '/analytic/{alias}': {
      get: {
        summary: 'Get URL Analytics',
        description: 'Fetch analytics for a specific shortened URL.',
        tags: ['Analytics'],
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'alias',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              example: 'abc123',
            },
            description: 'The alias for the shortened URL.',
          },
        ],
        responses: {
          200: {
            description: 'Analytics fetched successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    alias: {
                      type: 'string',
                      example: 'abc123',
                    },
                    clicks: {
                      type: 'integer',
                      example: 42,
                    },
                    browsers: {
                      type: 'object',
                      example: {
                        Chrome: 20,
                        Firefox: 10,
                        Safari: 12,
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Alias not found.',
          },
        },
      },
    },
    '/analytics/topic/{topic}': {
      get: {
        summary: 'Get Topic Analytics',
        description: 'Fetch analytics for all shortened URLs under a specific topic.',
        tags: ['Analytics'],
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'topic',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              example: 'marketing',
            },
            description: 'The topic for which to fetch analytics.',
          },
        ],
        responses: {
          200: {
            description: 'Topic analytics fetched successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    topic: {
                      type: 'string',
                      example: 'marketing',
                    },
                    totalClicks: {
                      type: 'integer',
                      example: 150,
                    },
                    urls: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          alias: {
                            type: 'string',
                            example: 'abc123',
                          },
                          clicks: {
                            type: 'integer',
                            example: 42,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Topic not found.',
          },
        },
      },
    },
    '/analytics/overall': {
      get: {
        summary: 'Get Overall Analytics',
        description: 'Fetch overall analytics for all shortened URLs.',
        tags: ['Analytics'],
        security: [
          {
            BearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: 'Overall analytics fetched successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalUrls: {
                      type: 'integer',
                      example: 500,
                    },
                    totalClicks: {
                      type: 'integer',
                      example: 2000,
                    },
                    topTopics: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          topic: {
                            type: 'string',
                            example: 'marketing',
                          },
                          totalClicks: {
                            type: 'integer',
                            example: 1500,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
