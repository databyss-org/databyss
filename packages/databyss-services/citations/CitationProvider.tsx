import { createContext, useContextSelector } from 'use-context-selector'
import { debounce } from 'lodash'
import MurmurHash3 from 'imurmurhash'
import React, { useCallback } from 'react'

import createReducer from '@databyss-org/services/lib/createReducer'

import { CitationFormatOptions, SourceDetail } from '../interfaces'
import { processCitation } from './actions'
import reducer from './reducer'
import { CitationDTO } from '../interfaces/Citation'

interface PropsType {
  children: JSX.Element
}

interface ContextType {
  generateCitation: (
    source: SourceDetail,
    options: CitationFormatOptions
  ) => String
}

const useReducer = createReducer()

export const CitationContext = createContext<ContextType>(null!)
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
      citationCache: {},
    },
    { name: 'CitationProvider', initializer: null, onChange: null }
  )

  const debouncedProcessCitation = useCallback(
    debounce((data: CitationDTO, hash: String) => {
      dispatch(processCitation(data, hash))
      return null
    }, citationUpdateCooldown),
    [state.citationCache]
  )

  const generateCitation = useCallback(
    (source: SourceDetail, options: CitationFormatOptions) => {
      const hash = generateHash(source, options).toString()
      if (state.citationCache[hash]) {
        return state.citationCache[hash]
      }

      return debouncedProcessCitation({ source, options }, hash)
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

export const useCitationContext = (selector = (x: ContextType) => x) =>
  useContextSelector(CitationContext, selector)

export default CitationProvider
