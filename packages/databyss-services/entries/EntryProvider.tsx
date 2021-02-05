import React, { useCallback, useRef, useEffect } from 'react'
import { debounce } from 'lodash'
import { BlockRelationPayload } from '@databyss-org/editor/interfaces'
import createReducer from '@databyss-org/services/lib/createReducer'
import { createContext, useContextSelector } from 'use-context-selector'
import reducer, { initialState as _initState } from './reducer'
import {
  onSearchEntries,
  onSetQuery,
  onClearCache,
  onSetBlockRelations,
  fetchBlockRelations,
  onClearBlockRelationsCache,
} from './actions'
import { optimizeBlockRelations } from './util'
import { initSearchIndex, dbRef } from '../../databyss-data/pouchdb/db'
import { BlockType } from '../interfaces/Block'
import { DocumentType } from '../../databyss-data/pouchdb/interfaces'
import {
  Text,
  BlockRelationsServerResponse,
  ResourceResponse,
  EntryState,
} from '../interfaces'

const THROTTLE_BLOCK_RELATIONS = 100

const useReducer = createReducer()

interface PropsType {
  children: JSX.Element
  // todo: get state
  initialState: any
}

export interface EntryContextType {
  state: EntryState
  searchTerm: string
  clearSearchCache: () => void
  setQuery: (query: Text) => void
  setBlockRelations: (blockRelations: BlockRelationPayload) => Promise<any>
  searchCache: any
  searchEntries: (query: string) => void
  findBlockRelations: (
    query: string
  ) => ResourceResponse<BlockRelationsServerResponse>
  clearBlockRelationsCache: () => void
}

export const EntryContext = createContext<EntryContextType>(null!)

const EntryProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState = _initState,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { searchCache, searchTerm, blockRelationsSearchCache } = state

  const blockRelationsQueueRef = useRef<BlockRelationPayload[] | null>([])

  const searchEntries = useCallback(
    debounce((query: string) => {
      const _results = searchCache[query]
      if (!_results) {
        return dispatch(onSearchEntries(query))
      }
      return null
    }, 250),
    [searchCache]
  )

  // https://github.com/pouchdb-community/pouchdb-quick-search/issues/57

  /*
  HACK this initiates a search index, if index is already built, this function will pass through
  */

  useEffect(() => {
    setTimeout(() => {
      indexedDB.databases().then((r) => {
        if (!r.find((_db) => _db.name.includes('_pouch_local-search'))) {
          setTimeout(() => {
            console.log('building search index')
            searchEntries('xxxxx')
          }, 5000)
        }
      })

      // searchEntries('testing')
    }, 1000)
  }, [])

  const setQuery = (query: Text) => {
    dispatch(onSetQuery(query))
  }

  const clearSearchCache = () => {
    dispatch(onClearCache())
  }

  const throttleBlockRelations = debounce((callback) => {
    if (blockRelationsQueueRef?.current?.length) {
      const _blockRelations = optimizeBlockRelations(
        blockRelationsQueueRef.current
      )

      dispatch(onSetBlockRelations(_blockRelations, callback))
      blockRelationsQueueRef.current = []
    }
  }, THROTTLE_BLOCK_RELATIONS)

  // async function could receive a callback function
  const setBlockRelations = (blockRelations: BlockRelationPayload) =>
    new Promise((res) => {
      // if callback is provided, this function will wait till throttle is complete before executing callback function
      if (
        blockRelations?.blocksRelationArray?.length ||
        blockRelations.clearPageRelationships
      ) {
        const _arr = blockRelationsQueueRef.current
        _arr?.push(blockRelations)
        blockRelationsQueueRef.current = _arr
        // pass the callback to the throttle function
        throttleBlockRelations(res)
      }
    })

  const findBlockRelations = (
    query: string
  ): ResourceResponse<BlockRelationsServerResponse> => {
    // fetch block relations from the server
    const _results = blockRelationsSearchCache[query]
    if (_results) {
      return blockRelationsSearchCache[query]
    }
    dispatch(fetchBlockRelations(query))
    return null
  }

  const clearBlockRelationsCache = () => {
    dispatch(onClearBlockRelationsCache())
  }

  return (
    <EntryContext.Provider
      value={{
        state,
        searchTerm,
        clearSearchCache,
        setQuery,
        setBlockRelations,
        searchCache,
        searchEntries,
        findBlockRelations,
        clearBlockRelationsCache,
      }}
    >
      {children}
    </EntryContext.Provider>
  )
}

export const useEntryContext: <T>(selector: (c: EntryContextType) => T) => T = (
  selector
) => useContextSelector(EntryContext, selector)

export default EntryProvider
