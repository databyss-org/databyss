import { PublicationTypeId } from '../../citations/constants/PublicationTypeId';

export default function isArticle(publicationType: string): Boolean {
  return (
    publicationType === PublicationTypeId.JOURNAL_ARTICLE ||
    publicationType === PublicationTypeId.NEWSPAPER_ARTICLE ||
    publicationType === PublicationTypeId.MAGAZINE_ARTICLE
  )
}
