/* eslint-disable eqeqeq */

import MonthOptions, {
  defaultMonthOption,
} from '../../citations/constants/MonthOptions'
import SeasonOptions from '../../citations/constants/SeasonOptions'

export default function findPublicationMonthOption(
  value: String | Number
): SelectOption {
  // try months
  let option = MonthOptions.find(
    monthOption =>
      // necessary to not use strict equality
      // since type of value may differ from id
      // but comparison is exactly what is needed
      monthOption.id == value
  )

  if (option) {
    return option
  }

  // try seasons
  option = SeasonOptions.find(
    monthOption =>
      // necessary to not use strict equality
      // since type of value may differ from id
      // but comparison is exactly what is needed
      monthOption.id == value
  )

  if (option) {
    return option
  }

  // no match found
  return defaultMonthOption
}
