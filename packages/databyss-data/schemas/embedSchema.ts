import { JSONSchema4 } from 'json-schema'

export const embedSchema: JSONSchema4 = {
  title: 'Embed',
  type: 'object',
  properties: {
    detail: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
        },
        src: {
          type: 'string',
        },
        dimensions: {
          type: 'object',
          properties: {
            width: {
              type: 'number',
            },
            height: { type: 'number' },
          },
        },
        mediaType: {
          type: 'string',
        },
        embedCode: {
          type: 'string',
        },
      },
      required: ['src', 'mediaType'],
    },
  },
  required: ['detail'],

  // extend pouchdb types
  // extend block types
  allOf: [{ $ref: 'pouchDb' }, { $ref: 'blockSchema' }],
}

export default embedSchema
