import { getDocument } from '@databyss-org/data/pouchdb/utils'

export const UNTITLED_NAME = 'untitled collection'

export const getGroup = (id: string) => getDocument(id)
