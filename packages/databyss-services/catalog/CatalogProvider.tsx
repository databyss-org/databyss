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
import { getCatalogSearchType } from './util'

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
  searchCatalog: ({
    type,
    query,
  }: SearchCatalogParams) => ResourceResponse<GroupedCatalogResults>
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
    ({
      query,
      type,
    }: SearchCatalogParams): ResourceResponse<GroupedCatalogResults> => {
      if (!query) return null
      // allow only alphanumeric characters if its not ISBN OR DOI
      const _query = !getCatalogSearchType(query)
        ? query.replace(/[^a-z0-9 ]/gi, '')
        : query
      if (state.searchCache[type]?.[_query]) {
        return state.searchCache[type][_query]
      }
      return _searchCatalog({ query: _query, type })
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

export const useCatalogContext = (selector = (x) => x) =>
  useContextSelector(CatalogContext, selector)

CatalogProvider.defaultProps = {
  initialState,
}

export default CatalogProvider
