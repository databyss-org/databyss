import { RxCollection, RxJsonSchema, RxDocument } from 'rxdb'

type CollectionUserDocType = {
  name: string
  role: string
}

type CollectionDocType = {
  _id: string
  name: string
  users: CollectionUserDocType[]
  defaultPageId: string
}

export type CollectionDoc = RxDocument<CollectionDocType>
export type CollectionCollection = RxCollection<CollectionDocType>
export const CollectionSchema: RxJsonSchema<CollectionDocType> = {
  title: 'collection schema',
  version: 0,
  description:
    'A Databyss Collection is a set of pages and blocks that share properties like read/write permissions',
  type: 'object',
  properties: {
    _id: {
      type: 'string',
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
}
