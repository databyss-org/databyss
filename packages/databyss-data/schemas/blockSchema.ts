import { JSONSchema4 } from 'json-schema'

export const blockSchema: JSONSchema4 = {
  title: 'BlockSchema',
  type: 'object',
  properties: {
    type: {
      type: 'string',
    },
    text: {
      $ref: 'text',
    },
    account: {
      type: 'string',
    },
    _deleted: {
      type: 'boolean',
    },
  },
  // TODO: account must become groupId and be required
  required: ['type', 'text'],
}

export default blockSchema
