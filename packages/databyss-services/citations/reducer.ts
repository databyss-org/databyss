import produce from 'immer'

import { FSA } from '../interfaces'
import { ResourcePending } from '../interfaces/ResourcePending'

import CitationProcessStatus from './constants/CitationProcessStatus'
import {
  CACHE_CITATION,
  CITEPROC_ERROR,
  PROCESS_CITATION,
  STOP_PROCESSING_CITATION,
} from './constants/Actions'

export default produce((state: any, action: FSA) => {
  switch (action.type) {
    case PROCESS_CITATION: {
      const { hash } = action.payload
      state.status = CitationProcessStatus.PROCESSING
      state.citationCache[hash] = new ResourcePending()
      break
    }

    case CACHE_CITATION: {
      const { citation, hash } = action.payload
      if (citation !== CITEPROC_ERROR) {
        state.status = CitationProcessStatus.IDLE
        state.citationCache[hash] = citation
        state.errorCount = 0
      } else {
        state.status = CitationProcessStatus.ERROR
        state.errorCount += 1
      }
      break
    }

    case STOP_PROCESSING_CITATION: {
      state.status = CitationProcessStatus.IDLE
      state.queue.current = null
      state.queue.next = null
      state.errorCount = 0
      break
    }
  }
})
