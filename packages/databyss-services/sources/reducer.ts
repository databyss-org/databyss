import produce, { Draft } from 'immer'

import { FSA, SourceState } from '../interfaces'
import { defaultCitationStyle } from '../citations/constants'

import { SET_PREFERRED_CITATION_STYLE } from './constants'

export const initialState: SourceState = {
  preferredCitationStyle: defaultCitationStyle?.id || 'mla',
}

export default produce((draft: Draft<SourceState>, action: FSA) => {
  switch (action.type) {
    case SET_PREFERRED_CITATION_STYLE: {
      if (action.payload.styleId !== draft.preferredCitationStyle) {
        // save style because different than previous
        draft.preferredCitationStyle = action.payload.styleId
      }
      break
    }
  }
})
