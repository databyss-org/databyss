import { JSONSchema4 } from 'json-schema'

export const topicSchema: JSONSchema4 = {
  title: 'Topic',
  type: 'object',
  // extend pouchdb types
  // extend block types
  allOf: [{ $ref: 'pouchDb' }, { $ref: 'blockSchema' }],
}

export default topicSchema
