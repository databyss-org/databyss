import { JSONSchema4 } from 'json-schema'

export const selectionSchema: JSONSchema4 = {
  title: 'Selection',
  type: 'object',
  properties: {
    anchor: {
      $ref: 'point',
    },
    focus: {
      $ref: 'point',
    },
  },
  // extend pouchdb types
  allOf: [{ $ref: 'pouchDb' }],
  required: ['anchor', 'focus'],
}

export default selectionSchema
