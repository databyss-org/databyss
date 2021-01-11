import { JSONSchema4 } from 'json-schema'

export const entrySchema: JSONSchema4 = {
  title: 'Entry',
  type: 'object',
  properties: {
    page: {
      type: 'string',
    },
  },
  // extend pouchdb types
  // extend block types
  allOf: [{ $ref: 'pouchDb' }, { $ref: 'blockSchema' }],
  required: ['page'],
}

export default entrySchema
