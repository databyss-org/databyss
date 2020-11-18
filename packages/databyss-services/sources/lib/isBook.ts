import { PublicationTypeId } from '../constants/PublicationTypeId'
import { SelectOption } from '../../interfaces/UI'

export function isBook(publicationType: SelectOption): Boolean {
  return (
    publicationType.id === PublicationTypeId.BOOK ||
    publicationType.id === PublicationTypeId.BOOK_SECTION
  )
}
