import { JSONSchema4 } from 'json-schema'

export const groupPreferenceSchema: JSONSchema4 = {
  title: 'GroupPreferences',
  type: 'object',
  properties: {
    userId: {
      type: 'string',
    },
    defaultPageId: {
      type: 'string',
    },
    notifications: {
      type: 'array',
      items: {
        $ref: 'notification',
      },
    },
  },
  required: ['groups', 'userId'],
  allOf: [{ $ref: 'pouchDb' }],
}

export default userPreferenceSchema
