import { JSONSchema4 } from 'json-schema'

export const entrySchema: JSONSchema4 = {
  title: 'Entry',
  type: 'object',
  // extend pouchdb types
  // extend block types
  allOf: [{ $ref: 'pouchDb' }, { $ref: 'blockSchema' }],
}

export default entrySchema
