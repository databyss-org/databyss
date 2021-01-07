import { JSONSchema4 } from 'json-schema'

export const entrySchema: JSONSchema4 = {
  title: 'Entry',
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
    type: {
      type: 'string',
    },
    text: {
      $ref: 'text',
    },
    page: {
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
    // TODO: CHANGE THIS TO GROUPS
    account: {
      type: 'string',
    },
  },
  required: ['_id', 'type', '$type', 'text', 'page'],
}

export default entrySchema
