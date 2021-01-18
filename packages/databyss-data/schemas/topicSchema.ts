import { JSONSchema4 } from 'json-schema'

export const topicSchema: JSONSchema4 = {
  title: 'Topic',
  type: 'object',
  properties: {
    page: {
      type: 'string',
    },
  },
  // extend pouchdb types
  // extend block types
  allOf: [{ $ref: 'pouchDb' }, { $ref: 'blockSchema' }],
  //   required: ['page'],
}

export default topicSchema
