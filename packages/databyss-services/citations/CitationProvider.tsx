import { createContext, useContextSelector } from 'use-context-selector'
import { debounce } from 'lodash'
import MurmurHash3 from 'imurmurhash'
import React, { useCallback } from 'react'

import createReducer from '@databyss-org/services/lib/createReducer'

import { SourceDetail } from '../interfaces'

import { CitationDTO, CitationProcessOptions, processCitation } from './actions'
import { CitationFormatOptions } from '.'
import { CITEPROC_ERROR, STOP_PROCESSING_CITATION } from './constants/Actions'
import CitationProcessStatus from './constants/CitationProcessStatus'
import reducer from './reducer'

interface PropsType {
  children: JSX.Element
}

interface ContextType {
  citationHTML: string
}

const useReducer = createReducer()
const maxErrorCount = 10

export const CitationContext = createContext<ContextType | null>(null)
export const citationUpdateCooldown = 1500

const generateHash = (source: SourceDetail, options: CitationFormatOptions) => {
  const str = JSON.stringify({
    source,
    options,
  })
  return MurmurHash3(str).result()
}

const CitationProvider: React.FunctionComponent<PropsType> = (
  props: PropsType
) => {
  const [state, dispatch] = useReducer(
    reducer,
    {
      status: CitationProcessStatus.IDLE,
      errorCount: 0,
      queue: {
        current: null,
        next: null,
      },
      citationCache: {},
    },
    { name: 'CitationProvider' }
  )

  const debouncedProcessCitation = useCallback(
    debounce((data: CitationDTO, options: CitationProcessOptions) => {
      console.info('--- CitationProvider.debouncedProcessCitation ---')

      const { queue, status, errorCount } = state

      if (status === CitationProcessStatus.ERROR) {
        console.warn('well thats your problem!')
        console.log('error count', errorCount)

        if (errorCount > maxErrorCount) {
          console.warn('give up, too many errors...')
          console.log('current cache:', state.citationCache[options.hash])
          dispatch({ type: STOP_PROCESSING_CITATION })
          return null
        }

        const isSameHash = queue.current.options.hash === options.hash
        if (!isSameHash) {
          console.warn('hash differs, update queue')
          queue.current = { data, options }
          queue.next = null
        }

        console.log('retry...')
        dispatch(processCitation())
        return null
      }

      // already cache of current hash
      const currentCitationCache = state.citationCache[options.hash]
      if (currentCitationCache && currentCitationCache !== CITEPROC_ERROR) {
        console.warn('already has citation, returning')
        console.log('currentCitationCache:', currentCitationCache)
        dispatch({ type: STOP_PROCESSING_CITATION })
        return currentCitationCache
      }

      // no cache or no current queue
      if (!state.citationCache[options.hash] || !queue.current) {
        console.warn('no cache or no current queue, start process')
        queue.current = { data, options }
        queue.next = null
        dispatch(processCitation())
        return null
      }

      return state.citationCache[options.hash]
    }, citationUpdateCooldown)
  )

  const generateCitation = useCallback(
    (source: SourceDetail, options: CitationFormatOptions) => {
      console.info('--- CitationProvider.generateCitation ---')

      const { status } = state

      const hash = generateHash(source, options)

      // already in process
      if (status === CitationProcessStatus.PROCESSING) {
        console.warn('already processing, updating next in queue')
        state.queue.next = {
          data: { source, options },
          options: { hash },
        }
        return null
      }

      return debouncedProcessCitation({ source, options }, { hash })
      // return state.citationCache[hash]
    },
    [state]
  )

  return (
    <CitationContext.Provider
      value={{
        generateCitation,
      }}
    >
      {props.children}
    </CitationContext.Provider>
  )
}

export const useCitationContext = (selector = x => x) =>
  useContextSelector(CitationContext, selector)

export default CitationProvider
