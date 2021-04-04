import { JSONSchema4 } from 'json-schema'

export const groupSchema: JSONSchema4 = {
  title: 'Page',
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    dbName: {
      type: 'string',
    },
    pages: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    public: {
      type: 'boolean',
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
  // extend pouchdb types
  allOf: [{ $ref: 'pouchDb' }],
  required: ['pages'],
}

export default groupSchema
