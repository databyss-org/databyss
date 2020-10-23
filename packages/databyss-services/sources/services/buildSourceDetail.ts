import { defaultMonthOption } from '../../citations/constants/MonthOptions'
import { defaultPublicationType } from '../../citations/constants/PublicationTypes'
import { SourceDetail } from '../../interfaces'

export default function buildSourceDetail(): SourceDetail {
  return {
    title: '',
    authors: [],
    editors: [],
    translators: [],
    publicationType: defaultPublicationType,
    month: defaultMonthOption,
  }
}
