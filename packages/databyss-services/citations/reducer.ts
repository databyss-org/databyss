import { produce } from 'immer'

import { FSA } from '../interfaces'
import { ResourcePending } from '../interfaces/ResourcePending'

import { CACHE_CITATION, PROCESS_CITATION } from './constants'

export default produce((state: any, action: FSA) => {
  switch (action.type) {
    case PROCESS_CITATION: {
      const { hash } = action.payload
      state.citationCache[hash] = new ResourcePending()
      break
    }

    case CACHE_CITATION: {
      const { citation, hash } = action.payload
      state.citationCache[hash] = citation
      break
    }
  }
})
