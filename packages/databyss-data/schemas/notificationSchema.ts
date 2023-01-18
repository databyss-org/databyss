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
    targetVersion: {
      type: 'string',
    },
    createdAt: {
      type: 'number',
    },
    viewedAt: {
      type: 'number',
    },
    migrationId: {
      type: 'string',
    },
  },
  required: ['id', 'type', 'messageHtml', 'createdAt'],
}

export default notificationSchema
