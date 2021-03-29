import { JSONSchema4 } from 'json-schema'

export const userPreferenceSchema: JSONSchema4 = {
  title: 'UserPreferences',
  type: 'object',
  properties: {
    email: {
      type: 'string',
    },
    userId: {
      type: 'string',
    },
    token: {
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
    messagesShown: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
  required: ['groups', 'userId'],
  allOf: [{ $ref: 'pouchDb' }],
}

export default userPreferenceSchema
