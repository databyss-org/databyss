import { JSONSchema4 } from 'json-schema'

export const selectionSchema: JSONSchema4 = {
  title: 'Selection',
  type: 'object',
  properties: {
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
  },
  // extend pouchdb types
  allOf: [{ $ref: 'pouchDb' }],
  required: ['anchor', 'focus'],
}

export default selectionSchema
