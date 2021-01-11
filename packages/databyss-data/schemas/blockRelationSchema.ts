import { JSONSchema4 } from 'json-schema'

export const blockRelationSchema: JSONSchema4 = {
  title: 'BlockRelation',
  type: 'object',
  properties: {
    block: {
      type: 'string',
    },
    relatedBlock: {
      type: 'string',
    },
    relationshipType: {
      type: 'string',
    },
    relatedBlockType: {
      type: 'string',
    },
    page: {
      type: 'string',
    },
    blockIndex: {
      type: 'number',
    },
    blockText: {
      $ref: 'text',
    },
  },
  allOf: [{ $ref: 'pouchDb' }],
  required: [
    'block',
    'relatedBlock',
    'relatedBlockType',
    'relationshipType',
    'page',
    'blockIndex',
    'blockText',
  ],
}

export default blockRelationSchema
