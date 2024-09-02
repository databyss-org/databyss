import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { CouchDb } from '@databyss-org/data/couchdb/couchdb'
import {
  dbRef,
  initDbFromJson,
  initSearchDbFromJson,
  selectors,
} from '@databyss-org/data/pouchdb/db'
import { useContextSelector, createContext } from 'use-context-selector'
import { VouchDb, connect } from '@databyss-org/data/vouchdb/vouchdb'
import { Viewport, Text, View, ModalManager } from '@databyss-org/ui'
import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import {
  LoadingFallback,
  useNavigationContext,
} from '@databyss-org/ui/components'
import { DatabyssMenuItems } from '@databyss-org/ui/components/Menu/DatabyssMenu'
import DatabyssLogo from '@databyss-org/ui/assets/logo-thick.png'
import { darkTheme, pxUnits } from '@databyss-org/ui/theming/theme'
import { appCommands } from '@databyss-org/ui/lib/appCommands'
import { removeDuplicatesFromArray } from '@databyss-org/data/pouchdb/groups'
import { upsertImmediate } from '@databyss-org/data/pouchdb/utils'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import { version } from '../version'
import { getAccountFromLocation, RemoteDbInfo } from '../session/utils'
import { Group } from '../interfaces'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('@databyss-org/desktop/src/eapi').default

interface ContextType {
  isCouchMode: boolean
  isDesktopMode: boolean
  groupId: string | null
  updateDatabaseStatus: () => void
  setCouchMode: (value: boolean) => void
  importDatabase: () => void
  setGroup: (group: Group) => void
  removeGroup: (group: Group) => void
}

export const DatabaseContext = createContext<ContextType>(null!)

export interface DatabaseStatus {
  isCouchMode: boolean
  isDesktopMode: boolean
  groupId: string | null
}

export const DatabaseProvider = ({
  children,
  noGroupHeader,
  isPublished,
}: {
  noGroupHeader: ReactNode
  isPublished?: boolean
}) => {
  const queryClient = useQueryClient()
  const navigate = useNavigationContext((c) => c && c.navigate)
  const showModal = useNavigationContext((c) => c && c.showModal)
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>({
    isCouchMode: false,
    isDesktopMode: false,
    groupId: null,
  })
  const [isBusy, setIsBusy] = useState<boolean>(false)

  // console.log('[DatabaseProvider] groupId', dbRef.groupId)

  const updateDatabaseStatus = useCallback(() => {
    // console.log('[DatabaseProvider] update', databaseStatus, dbRef)
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

  const initDb = async () => {
    // check for group loaded by electron
    if (eapi.isDesktop) {
      const _groupId = await eapi.db.getGroupId()
      // console.log('[DatabaseProvider] preload groupId', _groupId)
      if (_groupId) {
        connect(_groupId)
        updateDatabaseStatus()
      }
    } else {
      const _groupId = getAccountFromLocation()
      console.log('[DatabyssProvider] groupId from url', _groupId)
      if (_groupId) {
        await initDbFromJson(_groupId as string)
        updateDatabaseStatus()
        if (dbRef.searchMd5) {
          await initSearchDbFromJson(_groupId as string, dbRef.searchMd5)
        } else {
          console.log('[DatabaseProvider] missing dbRef.searchMd5')
        }
      }
    }
  }

  const importDatabase = (groupId?: string) => {
    console.log('[DatabaseProvider] importDatabase', groupId)
    return new Promise<boolean>((resolve) => {
      showModal({
        component: 'IMPORTDB',
        props: {
          groupId,
          onImport: () => {
            resolve(true)
          },
          onCancel: () => {
            resolve(false)
          },
        },
        visible: true,
      })
    })
  }

  useEffect(() => {
    appCommands.addListener('importDatabase', importDatabase)

    dbRef.on('groupIdUpdated', () => {
      queryClient.clear()
      updateDatabaseStatus()
      setIsBusy(false)
      navigate('/')
    })

    initDb()

    return () => {
      appCommands.removeListener('exportDatabase', importDatabase)
      dbRef.off('groupIdUpdated', updateDatabaseStatus)
    }
  }, [])

  const setGroup = async (group: Group, skipCaches?: boolean) => {
    console.log('[DatabaseProvider] setGroup')
    // prevent duplicates
    if (group.pages) {
      group.pages = removeDuplicatesFromArray(group.pages)
    }

    // update caches
    if (!skipCaches) {
      queryClient.setQueryData([selectors.GROUPS], (oldData: any) => ({
        ...(oldData ?? {}),
        [group._id]: group,
      }))
      queryClient.setQueryData([`useDocument_${group._id}`], group)
    }

    await upsertImmediate({
      doctype: DocumentType.Group,
      _id: group._id,
      doc: group,
    })
  }

  const removeGroup = async (group: Group) => {
    console.log('[removeGroup]', group._id)

    // delete group locally
    await upsertImmediate({
      doctype: DocumentType.Group,
      _id: group._id,
      doc: { ...group, _deleted: true },
    })

    // remove from caches
    queryClient.setQueryData([selectors.GROUPS], (oldData: any) => {
      if (!oldData) {
        return {}
      }
      const _next = { ...oldData }
      delete _next[group._id]
      return _next
    })
    queryClient.resetQueries({
      queryKey: [`useDocument_${group._id}`],
      exact: true,
    })
    queryClient.removeQueries({
      queryKey: [`useDocument_${group._id}`],
      exact: true,
    })
  }

  const { isCouchMode, isDesktopMode, groupId } = databaseStatus

  return (
    <DatabaseContext.Provider
      value={{
        isCouchMode,
        isDesktopMode,
        groupId,
        setCouchMode,
        updateDatabaseStatus,
        importDatabase,
        setGroup,
        removeGroup,
      }}
      key={databaseStatus.groupId ?? 'nogroup'}
    >
      {databaseStatus.groupId !== null && dbRef.initialSyncComplete ? (
        children
      ) : (
        <Viewport justifyContent="center" theme={darkTheme} bg="background.1">
          {noGroupHeader}
          {isBusy ? (
            <LoadingFallback />
          ) : (
            <View alignItems="center" flexDirection="row">
              <View mr="medium" alignItems="center">
                <img src={DatabyssLogo} width={128} />
                <Text variant="uiTextExtraLarge">Databyss</Text>
                <Text variant="uiTextSmall">version {version}</Text>
                {isPublished && (
                  <View mt="large">
                    <LoadingFallback />
                  </View>
                )}
              </View>
              {!isPublished && (
                <View maxWidth={pxUnits(300)}>
                  <DatabyssMenuItems
                    onLoading={(group) => {
                      setIsBusy(!!group)
                    }}
                  />
                </View>
              )}
            </View>
          )}
          <ModalManager />
        </Viewport>
      )}
    </DatabaseContext.Provider>
  )
}

export const useDatabaseContext = (selector = (x) => x) =>
  useContextSelector(DatabaseContext, selector)

export const useRemoteDbInfo = (groupId?: string) => {
  const _groupId = groupId ? groupId.substring(2) : 'nogroup'
  const _res = useQuery<any>({
    queryKey: [`remoteDbInfo_${_groupId}`],
    queryFn: async () => {
      const _res = await fetch(
        `${process.env.DBFILE_URL}${groupId}/databyss-db-${_groupId}-info.json`
      )
      return _res.json()
    },
    enabled: !!groupId,
  })
  return _res as UseQueryResult<RemoteDbInfo>
}
