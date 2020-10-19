import { SourceDetail } from '../interfaces'

import {
  CACHE_CITATION,
  CITEPROC_ERROR,
  PROCESS_CITATION,
} from './constants/Actions'
import { CitationFormatOptions } from '.'
import { formatCitation } from './services/formatCitation'
import { toJsonCsl } from './services/toJsonCsl'
import CitationProcessStatus from './constants/CitationProcessStatus'

export interface CitationDTO {
  source: SourceDetail
  options: CitationFormatOptions
}

export interface CitationProcessOptions {
  hash: String
}

export function processCitation() {
  console.info('--- actions.processCitation ---')

  return async (dispatch: Function, getState: () => any) => {
    const state = getState()
    console.log('state.status:', state.status)

    if (state.status === CitationProcessStatus.PROCESSING) {
      console.warn('ignored...')
      return
    }

    const { queue } = state
    const { current } = queue
    const { data, options } = current

    console.log('start process')
    dispatch({
      type: PROCESS_CITATION,
      payload: { hash: options.hash },
    })

    try {
      const csl = toJsonCsl(data.source)
      const citation = await formatCitation(csl, data.options)

      // cache citation
      console.log('obtained citation, cache it')
      dispatch({
        type: CACHE_CITATION,
        payload: {
          citation,
          hash: options.hash,
        },
      })

      if (queue.next && queue.next.hash !== queue.current.hash) {
        // next differs from current, restart process
        console.log('process next in queue')
        queue.current = queue.next
        queue.next = null
        dispatch(processCitation())
      } else {
        // same hash, thus same data, clear queue
        queue.current = null
        queue.next = null
        console.log('queue cleared!!')
      }
    } catch (error) {
      console.warn('error:', error.message)

      if (error.message === CITEPROC_ERROR) {
        // This most likely occurs because citation library
        // is not being defensive enough internally:
        // In citeproc_commonjs.js,
        // they do not check if `Item` exists
        // before trying to get its props.
        // ```
        // CSL.Disambiguation.prototype.getCiteData
        //   if (!this.maxNamesByItemId[Item.id]) { ...
        // ```
        dispatch({
          type: CACHE_CITATION,
          payload: {
            citation: CITEPROC_ERROR,
            hash: options.hash,
          },
        })
        // FIXME: what now!?
      } else {
        throw error
      }
    }
  }
}
