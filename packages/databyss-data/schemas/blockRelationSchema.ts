import { JSONSchema4 } from 'json-schema'

export const blockRelationSchema: JSONSchema4 = {
  title: 'BlockRelation',
  type: 'object',
  properties: {
    _rev: {
      type: 'string',
    },
    _revisions: {
      type: 'object',
      properties: {
        start: {
          type: 'number',
        },
        ids: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
    _id: {
      type: 'string',
    },
    $type: {
      type: 'string',
    },
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
    modifiedAt: {
      type: 'number',
    },
    createdAt: {
      type: 'number',
    },
  },
  required: [
    '_id',
    '$type',
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
