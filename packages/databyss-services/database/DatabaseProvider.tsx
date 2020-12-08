import React, { useCallback, useEffect, useState, useRef } from 'react'
import PouchDB from 'pouchdb'
import { createContext, useContextSelector } from 'use-context-selector'
import createReducer from '@databyss-org/services/lib/createReducer'
import reducer, { initialState as _initState } from './reducer'
import * as actions from './actions'

interface PropsType {
  children: JSX.Element
  initialState: any
}

interface ContextType {
  getDatabase: () => PouchDB.Database | null
  // getDb: () => PouchDB.Database | undefined
  putDocument: (doc: any) => void
  getDocument: (id: string) => any
}

export const DatabaseContext = createContext<ContextType>(null!)

const useReducer = createReducer()

const DatabaseProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState = _initState,
}: PropsType) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const putDocument = useCallback(
    (doc) => {
      if (state.db) {
        dispatch(actions.putDocument(doc, state.db))
      }
    },
    [state.db]
  )

  const getDatabase = useCallback(() => {
    if (state.db) {
      return state.db
    }
    dispatch(actions.getDatabase())
    return null
  }, [state.db])

  const getDocument = useCallback(
    (id) => {
      if (!state.db) {
        return null
      }
      if (state.pages[id]) {
        return state.pages[id]
      }
      dispatch(actions.getDocument(id, state.db))
      return null
    },
    [state.db, JSON.stringify(state.pages)]
  )

  return (
    <DatabaseContext.Provider
      value={{
        getDatabase,
        putDocument,
        getDocument,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  )
}

export const useDatabaseContext = (selector = (x: ContextType) => x) =>
  useContextSelector(DatabaseContext, selector)

export default DatabaseProvider
