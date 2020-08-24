import React, { useCallback } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
import createReducer from '@databyss-org/services/lib/createReducer'
import _ from 'lodash'
import reducer, { initialState } from './reducer'
import {
  ResourceResponse,
  CatalogState,
  CatalogType,
  GroupedCatalogResults,
} from '../interfaces'

import * as actions from './actions'

interface PropsType {
  children: JSX.Element
  initialState: CatalogState
}

interface SearchCatalogParams {
  type: CatalogType
  query: string
}

interface ContextType {
  state: CatalogState
  searchCatalog: (
    { type, query }: SearchCatalogParams
  ) => ResourceResponse<GroupedCatalogResults>
}

const useReducer = createReducer()
export const CatalogContext = createContext<ContextType | null>(null)

const CatalogProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState,
}: PropsType) => {
  const [state, dispatch] = useReducer(reducer, initialState, {
    name: 'CatalogProvider',
  })

  const _searchCatalog = useCallback(
    _.debounce(({ query, type }: SearchCatalogParams): ResourceResponse<
      GroupedCatalogResults
    > => {
      dispatch(actions.searchCatalog({ type, query }))
      return null
    }, 1000),
    [state.searchCache]
  )

  const searchCatalog = useCallback(
    ({ query, type }: SearchCatalogParams): ResourceResponse<
      GroupedCatalogResults
    > => {
      if (!query) return null
      if (state.searchCache[type]?.[query]) {
        return state.searchCache[type][query]
      }
      return _searchCatalog({ query, type })
    },
    [state.searchCache]
  )

  return (
    <CatalogContext.Provider
      value={{
        state,
        searchCatalog,
      }}
    >
      {children}
    </CatalogContext.Provider>
  )
}

export const useCatalogContext = (selector = x => x) =>
  useContextSelector(CatalogContext, selector)

CatalogProvider.defaultProps = {
  initialState,
}

export default CatalogProvider
