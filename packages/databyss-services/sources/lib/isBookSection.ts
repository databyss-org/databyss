import { PublicationTypeId } from '../constants/PublicationTypeId'

export function isBookSection(publicationType: string): Boolean {
  return publicationType === PublicationTypeId.BOOK_SECTION
}
