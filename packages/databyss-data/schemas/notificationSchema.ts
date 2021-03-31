import { JSONSchema4 } from 'json-schema'

export const notificationSchema: JSONSchema4 = {
  title: 'Notification',
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    messageHtml: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    href: {
      type: 'string',
    },
    createdAt: {
      type: 'number',
    },
  },
  required: ['id', 'type', 'messageHtml', 'createdAt'],
}

export default notificationSchema
