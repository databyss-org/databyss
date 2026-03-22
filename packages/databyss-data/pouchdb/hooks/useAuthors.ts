import { Author } from '@databyss-org/services/interfaces'
import { Document } from '@databyss-org/services/interfaces'
import { selectors } from '../selectors'
import { useDocuments } from './useDocuments'

export interface AuthorDoc extends Author, Document {
  _id: string
  doctype: 'AUTHOR'
  createdAt?: number
  modifiedAt?: number
  accessedAt?: number
}

export const useAuthors = () => useDocuments<AuthorDoc>(selectors.AUTHORS)
