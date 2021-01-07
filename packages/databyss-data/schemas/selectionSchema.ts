import { JSONSchema4 } from 'json-schema'

export const selectionSchema: JSONSchema4 = {
  title: 'Selection',
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
    anchor: {
      type: 'object',
      properties: {
        index: {
          type: 'number',
        },
        offset: {
          type: 'number',
        },
      },
    },
    focus: {
      type: 'object',
      properties: {
        index: {
          type: 'number',
        },
        offset: {
          type: 'number',
        },
      },
    },
    modifiedAt: {
      type: 'number',
    },
    createdAt: {
      type: 'number',
    },
  },
  required: ['_id', '$type', 'anchor', 'focus'],
}

export default selectionSchema
