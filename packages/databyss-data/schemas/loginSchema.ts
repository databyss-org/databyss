import { JSONSchema4 } from 'json-schema'

export const loginSchema: JSONSchema4 = {
  title: 'Login',
  type: 'object',
  properties: {
    _rev: {
      type: 'string',
    },
    _revisions: {
      type: 'object',
      properties: {
        start: {
          type: 'number',
        },
        ids: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
    _id: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
    code: {
      type: 'string',
    },
    token: {
      type: 'string',
    },
    createdAt: {
      type: 'number',
    },
  },
  required: ['_id', 'email', 'createdAt'],
}

export default loginSchema
