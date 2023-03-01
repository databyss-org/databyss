import React, { useCallback, useEffect, useState } from 'react'
import { CouchDb } from '@databyss-org/data/couchdb/couchdb'
import { dbRef } from '@databyss-org/data/pouchdb/db'
import { useContextSelector, createContext } from 'use-context-selector'

interface ContextType {
  isCouchMode: boolean
  updateCouchMode: () => void
  setCouchMode: (value: boolean) => void
}

export const DatabaseContext = createContext<ContextType>(null!)

export const DatabaseProvider = ({ children }) => {
  const [isCouchMode, setCouchMode] = useState(false)

  const updateCouchMode = useCallback(() => {
    setCouchMode(dbRef.current instanceof CouchDb)
  }, [setCouchMode])

  useEffect(() => {
    updateCouchMode()
  }, [dbRef.current])

  return (
    <DatabaseContext.Provider
      value={{ isCouchMode, setCouchMode, updateCouchMode }}
    >
      {children}
    </DatabaseContext.Provider>
  )
}

export const useDatabaseContext = (selector = (x) => x) =>
  useContextSelector(DatabaseContext, selector)
