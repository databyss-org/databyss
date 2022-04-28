import React, { createContext, useContext, useEffect, useState } from 'react'
import { CouchDb } from '@databyss-org/data/couchdb-client/couchdb'
import { dbRef } from '@databyss-org/data/pouchdb/db'

interface ContextType {
  isCouchMode: boolean
  updateCouchMode: () => void
  setCouchMode: (value: boolean) => void
}

export const DatabaseContext = createContext<ContextType>(null!)

export const DatabaseProvider = ({ children }) => {
  const [isCouchMode, setCouchMode] = useState(false)

  const updateCouchMode = () => {
    setCouchMode(dbRef.current instanceof CouchDb)
  }

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

export const useDatabaseContext = () => useContext(DatabaseContext)
