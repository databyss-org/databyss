import { JSONSchema4 } from 'json-schema'

export const pageSchema: JSONSchema4 = {
  title: 'Page',
  type: 'object',
  properties: {
    archive: {
      type: 'boolean',
    },
    name: {
      type: 'string',
    },
    blocks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
          },
          type: {
            type: 'string',
          },
        },
        required: ['_id', 'type'],
      },
    },
    selection: {
      type: 'string',
    },
  },
  // extend pouchdb types
  allOf: [{ $ref: 'pouchDb' }],
  required: ['blocks', 'name', 'selection'],
}

export default pageSchema
