import { JSONSchema4 } from 'json-schema'

export const textSchema: JSONSchema4 = {
  type: 'object',
  title: 'Text',
  properties: {
    textValue: {
      type: 'string',
    },
    ranges: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          length: {
            type: 'number',
          },
          offset: {
            type: 'number',
          },
          marks: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    },
  },
}

export default textSchema
