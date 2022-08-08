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
    doctype: {
      type: 'string',
    },
    createdAt: {
      type: 'number',
    },
    modifiedAt: {
      type: 'number',
    },
    accessedAt: {
      type: 'number',
    },
    _deleted: {
      type: 'boolean',
    },
    belongsToGroup: {
      type: 'string',
    },
    sharedWithGroups: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
  required: ['_id', 'doctype', 'createdAt', 'belongsToGroup'],
}

export default pouchDocSchema
