import { SourceDetail } from '../../interfaces'

import { defaultMonthOption } from '../constants/MonthOptions'
import { defaultPublicationType } from '../constants/PublicationTypes'

export function buildSourceDetail(): SourceDetail {
  return {
    title: '',
    authors: [],
    editors: [],
    translators: [],
    publicationType: defaultPublicationType,
    month: defaultMonthOption,
  }
}
