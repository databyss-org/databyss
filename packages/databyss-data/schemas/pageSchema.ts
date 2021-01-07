import { JSONSchema4 } from 'json-schema'

export const pageSchema: JSONSchema4 = {
  title: 'Page',
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
    archive: {
      type: 'boolean',
    },
    name: {
      type: 'string',
    },
    blocks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
          },
          type: {
            type: 'string',
          },
        },
      },
    },
    selection: {
      type: 'string',
    },
    createdAt: {
      type: 'number',
    },
    modifiedAt: {
      type: 'number',
    },
  },
  required: ['_id', '$type', 'blocks', 'name'],
}

export default pageSchema
