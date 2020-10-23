import { PublicationTypeId } from '../../citations/constants/PublicationTypeId';

export default function isBook(publicationType: string): Boolean {
  return (
    publicationType.id === PublicationTypeId.BOOK ||
    publicationType.id === PublicationTypeId.BOOK_SECTION
  )
}
