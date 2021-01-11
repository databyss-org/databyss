import { JSONSchema4 } from 'json-schema'

export const pouchDocSchema: JSONSchema4 = {
  title: 'PouchDocSchema',
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
    createdAt: {
      type: 'number',
    },
    modifiedAt: {
      type: 'number',
    },
  },
  required: ['_id', '$type', 'createdAt'],
}

export default pouchDocSchema
