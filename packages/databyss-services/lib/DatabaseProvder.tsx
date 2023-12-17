import React, { useCallback, useEffect, useState } from 'react'
import { CouchDb } from '@databyss-org/data/couchdb/couchdb'
import { dbRef } from '@databyss-org/data/pouchdb/db'
import { useContextSelector, createContext } from 'use-context-selector'
import { VouchDb, connect } from '@databyss-org/data/vouchdb/vouchdb'
import { Text } from '@databyss-org/ui'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigationContext } from '@databyss-org/ui/components'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../databyss-desktop/src/eapi').default

interface ContextType {
  isCouchMode: boolean
  isDesktopMode: boolean
  groupId: string | null
  updateDatabaseStatus: () => void
  setCouchMode: (value: boolean) => void
}

export const DatabaseContext = createContext<ContextType>(null!)

export interface DatabaseStatus {
  isCouchMode: boolean
  isDesktopMode: boolean
  groupId: string | null
}

export const DatabaseProvider = ({ children }) => {
  const queryClient = useQueryClient()
  const navigate = useNavigationContext((c) => c && c.navigate)
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>({
    isCouchMode: false,
    isDesktopMode: false,
    groupId: null,
  })

  // console.log('[DatabaseProvider] groupId', dbRef.groupId)

  const updateDatabaseStatus = useCallback(() => {
    console.log('[DatabaseProvider] update', databaseStatus, dbRef)
    setDatabaseStatus({
      isCouchMode: dbRef.current instanceof CouchDb,
      isDesktopMode: dbRef.current instanceof VouchDb,
      groupId: dbRef.groupId,
    })
  }, [databaseStatus])

  const setCouchMode = useCallback(
    (isCouchMode) => {
      setDatabaseStatus({ ...databaseStatus, isCouchMode })
    },
    [databaseStatus]
  )

  useEffect(() => {
    dbRef.on('groupIdUpdated', () => {
      queryClient.clear()
      updateDatabaseStatus()
      navigate('/')
    })

    // check for group loaded by electron
    if (eapi) {
      eapi.db.getGroupId().then((groupId) => {
        console.log('[DatabaseProvider] preload groupId', groupId)
        if (groupId !== null) {
          connect(groupId)
          updateDatabaseStatus()
        }
      })
    }

    return () => {
      dbRef.off('groupIdUpdated', updateDatabaseStatus)
    }
  }, [])

  const { isCouchMode, isDesktopMode, groupId } = databaseStatus

  return (
    <DatabaseContext.Provider
      value={{
        isCouchMode,
        isDesktopMode,
        groupId,
        setCouchMode,
        updateDatabaseStatus,
      }}
      key={databaseStatus.groupId ?? 'nogroup'}
    >
      {databaseStatus.groupId !== null ? (
        children
      ) : (
        <Text variant="uiTextNormal">No database</Text>
      )}
    </DatabaseContext.Provider>
  )
}

export const useDatabaseContext = (selector = (x) => x) =>
  useContextSelector(DatabaseContext, selector)
