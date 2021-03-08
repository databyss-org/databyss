import { JSONSchema4 } from 'json-schema'

export const documentSchema: JSONSchema4 = {
  title: 'DocumentSchema',
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
    doctype: {
      type: 'string',
    },
    createdAt: {
      type: 'number',
    },
    modifiedAt: {
      type: 'number',
    },
    _deleted: {
      type: 'boolean',
    },
    successorOf: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
  required: ['_id', 'doctype', 'createdAt', 'successorOf'],
}

export default documentSchema
