import { JSONSchema4 } from 'json-schema'

export const blockRelationSchema: JSONSchema4 = {
  title: 'BlockRelation',
  type: 'object',
  properties: {
    pages: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
  allOf: [{ $ref: 'pouchDb' }],
  required: ['pages'],
}

export default blockRelationSchema
