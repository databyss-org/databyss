import { JSONSchema4 } from 'json-schema'

export const embedSchema: JSONSchema4 = {
  title: 'Embed',
  type: 'object',
  properties: {
    detail: {
      type: 'object',
      properties: {
        openGraphJson: {
          type: 'string',
        },
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
      fileDetail: {
        type: 'object',
        properties: {
          filename: {
            type: 'string',
          },
          contentLength: {
            type: 'string',
          },
          contentType: {
            type: 'string',
          },
          storageKey: {
            type: 'string',
          },
        },
        required: ['filename', 'contentLength', 'contentType', 'storageKey'],
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
