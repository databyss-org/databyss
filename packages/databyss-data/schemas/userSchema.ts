import { JSONSchema4 } from 'json-schema'

export const userSchema: JSONSchema4 = {
  title: 'Users',
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
    email: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    googleId: {
      type: 'string',
    },
    defaultGroupId: {
      type: 'string',
    },
    // defaultPageId: {
    //   type: 'string',
    // },
    // groups: {
    //   type: 'array',
    //   items: {
    //     type: 'object',
    //     properties: {
    //       groupId: {
    //         type: 'string',
    //       },
    //       role: {
    //         type: 'string',
    //       },
    //     },
    //   },
    // },
    date: {
      type: 'string',
    },
  },
  required: ['_id', 'email'],
}

export default userSchema
