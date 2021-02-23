import { JSONSchema4 } from 'json-schema'

export const sysGroupSchema: JSONSchema4 = {
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
    defaultPageId: {
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
          role: {
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
      required: ['userId', 'dbkey', 'lastLoginAt', 'role'],
    },
  },
  required: ['_id', 'name', 'sessions'],
}

export default sysGroupSchema
