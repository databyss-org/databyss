import { JSONSchema4 } from 'json-schema'

export const pointSchema: JSONSchema4 = {
  title: 'Point',
  type: 'object',
  properties: {
    index: {
      type: 'number',
    },
    offset: {
      type: 'number',
    },
  },
  required: ['index', 'offset'],
}

export default pointSchema
