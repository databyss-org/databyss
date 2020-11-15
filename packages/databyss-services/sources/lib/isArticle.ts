import { PublicationTypeId } from '../constants/PublicationTypeId'

export function isArticle(publicationType: string): Boolean {
  return (
    publicationType === PublicationTypeId.JOURNAL_ARTICLE ||
    publicationType === PublicationTypeId.NEWSPAPER_ARTICLE ||
    publicationType === PublicationTypeId.MAGAZINE_ARTICLE
  )
}
