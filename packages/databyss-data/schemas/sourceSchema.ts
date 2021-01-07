import { JSONSchema4 } from 'json-schema'

export const sourceSchema: JSONSchema4 = {
  title: 'Source',
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
    $type: {
      type: 'string',
    },
    text: {
      $ref: 'text',
    },
    detail: {
      type: 'object',
      properties: {
        authors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              firstName: {
                $ref: 'text',
              },
              lastName: {
                $ref: 'text',
              },
            },
          },
        },
      },
    },
    title: {
      $ref: 'text',
    },
    createdAt: {
      type: 'number',
    },
  },
  required: ['_id', 'type', '$type', 'text'],
}

export default sourceSchema
