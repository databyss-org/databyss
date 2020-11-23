import { RxCollection, RxJsonSchema, RxDocument } from 'rxdb'

type GroupUserDocType = {
  name: string
  role: string
}

export type GroupDocType = {
  _id: string
  name: string
  users: GroupUserDocType[]
  defaultPageId: string
}

export type GroupDoc = RxDocument<GroupDocType>
export type GroupCollection = RxCollection<GroupDocType>
export const GroupSchema: RxJsonSchema<GroupDocType> = {
  title: 'group schema ("collections" to the user)',
  version: 0,
  description:
    'A Databyss Collection (Group) is a set of pages and blocks that share properties like read/write permissions',
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      primary: true,
    },
    name: {
      type: 'string',
    },
    users: {
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'object',
        properties: {
          role: {
            type: 'string',
            enum: ['ADMIN', 'EDITOR', 'CONTRIBUTOR', 'READONLY'],
          },
        },
      },
    },
    defaultPageId: {
      type: 'string',
    },
  },
  required: ['name', 'users', 'defaultPageId'],
}
