import React, { useCallback, useEffect, useState } from 'react'
import PouchDB from 'pouchdb'
import { createContext, useContextSelector } from 'use-context-selector'

interface PropsType {
  children: JSX.Element
}

interface ContextType {
  getDb: () => PouchDB.Database | undefined
}

const localDbName = 'test_pouch'

export const DatabaseContext = createContext<ContextType>(null!)

const DatabaseProvider: React.FunctionComponent<PropsType> = ({
  children,
}: PropsType) => {
  const [db, setDb] = useState<PouchDB.Database>()

  const createDb = () => {
    const _db = new PouchDB(localDbName)
    return _db
  }

  useEffect(() => {
    const init = async () => {
      setDb(await createDb())
    }
    init()
  }, [])

  const getDb = useCallback(() => {
    console.log(db)
    return db
  }, [db])

  return (
    <DatabaseContext.Provider
      value={{
        getDb,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  )
}

export const useDatabaseContext = (selector = (x: ContextType) => x) =>
  useContextSelector(DatabaseContext, selector)

export default DatabaseProvider
