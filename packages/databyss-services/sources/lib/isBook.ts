import { PublicationTypeId } from '../constants/PublicationTypeId'

export function isBook(publicationType: string): Boolean {
  return publicationType.id === PublicationTypeId.BOOK
}
