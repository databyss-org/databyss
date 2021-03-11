import { JSONSchema4 } from 'json-schema'

export const groupSchema: JSONSchema4 = {
  title: 'Page',
  type: 'object',
  properties: {
    name: {
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
  },
  // extend pouchdb types
  allOf: [{ $ref: 'pouchDb' }],
  required: ['pages'],
}

export default groupSchema
