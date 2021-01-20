import { JSONSchema4 } from 'json-schema'

export const userPreferenceSchema: JSONSchema4 = {
  title: 'UserPreferences',
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
    email: {
      type: 'string',
    },
    userId: {
      type: 'string',
    },
    token: {
      type: 'string',
    },
    defaultGroupId: {
      type: 'string',
    },
    groups: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          groupId: {
            type: 'string',
          },
          role: {
            type: 'string',
          },
          defaultPageId: {
            type: 'string',
          },
          dbKey: {
            type: 'string',
          },
        },
      },
    },
  },
  required: ['defaultGroupId', 'groups', 'userId'],
  allOf: [{ $ref: 'pouchDb' }],
}

export default userPreferenceSchema
