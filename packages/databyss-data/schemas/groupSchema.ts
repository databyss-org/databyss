import { JSONSchema4 } from 'json-schema'

export const userSchema: JSONSchema4 = {
  title: 'Groups',
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
    name: {
      type: 'string',
    },
    sessions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
          },
          dbKey: {
            type: 'string',
          },
          lastLoginAt: {
            type: 'number',
          },
          clientInfo: {
            type: 'string',
          },
        },
      },
      required: ['userId', 'dbkey', 'lastLoginAt'],
    },
  },
  required: ['_id', 'name', 'sessions'],
}

export default userSchema
