import { createContext, useContextSelector } from 'use-context-selector'
import { debounce } from 'lodash'
import MurmurHash3 from 'imurmurhash'
import React, { useCallback } from 'react'

import createReducer from '@databyss-org/services/lib/createReducer'

import { SourceDetail } from '../interfaces'

import { CitationDTO, CitationProcessOptions, processCitation } from './actions'
import { CitationFormatOptions } from '.'
import reducer from './reducer'

interface PropsType {
  children: JSX.Element
}

interface ContextType {
  citationHTML: string
}

const useReducer = createReducer()
export const CitationContext = createContext<ContextType | null>(null)

const generateHash = (source: SourceDetail) => {
  const str = JSON.stringify(source)
  return MurmurHash3(str).result()
}

const CitationProvider: React.FunctionComponent<PropsType> = (
  props: PropsType
) => {
  const [state, dispatch] = useReducer(
    reducer,
    { citationCache: {} },
    { name: 'CitationProvider' }
  )

  const debouncedProcessCitation = useCallback(
    debounce((data: CitationDTO, options: CitationProcessOptions) => {
      dispatch(processCitation(data, options))
      return null
    })
  )

  const generateCitation = useCallback(
    (source: SourceDetail, options: CitationFormatOptions) => {
      const hash = generateHash(source)
      if (!state.citationCache[hash]) {
        debouncedProcessCitation({ source, options }, { hash })
        return null
      }
      return state.citationCache[hash]
    },
    [state.citationCache]
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
