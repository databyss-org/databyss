import { JSONSchema4 } from 'json-schema'

export const blockRelationSchema: JSONSchema4 = {
  title: 'BlockRelation',
  type: 'object',
  properties: {
    blockId: {
      type: 'string',
    },
    pages: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    blockType: {
      type: 'string',
    },
  },
  allOf: [{ $ref: 'pouchDb' }],
  required: ['pages', 'blockId', 'blockType'],
}

export default blockRelationSchema
