import {
  Notification,
  NotificationType,
} from '@databyss-org/data/pouchdb/interfaces'
import semver from 'semver'
import { version } from '@databyss-org/services'
import { useUserPreferences } from '@databyss-org/data/pouchdb/hooks'
import { upsertUserPreferences } from '@databyss-org/data/pouchdb/utils'
import React, { createContext, useContext } from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { LoadingFallback } from '../../components'
import { useNotifyContext } from '../../components/Notify/NotifyProvider'

export interface NotificationsContextType {
  getUnreadNotifications: () => Notification[]
  setNotificationRead: (id: string) => void
}

export const UserPreferencesContext = createContext<NotificationsContextType>(
  null!
)

export const UserPreferencesProvider = ({ children }) => {
  const [queryRes, setUserPreferences] = useUserPreferences()
  const { notifyHtml } = useNotifyContext()
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)

  if (!isPublicAccount && !queryRes.isSuccess) {
    return <LoadingFallback queryObserver={queryRes} />
  }

  const setNotificationRead = (id: string) => {
    if (isPublicAccount) {
      // TODO: save to localstorage
      return
    }
    const _prefs = queryRes.data!
    const _notification = _prefs.notifications?.find((_n) => _n.id === id)
    if (!_notification) {
      console.error('Notification not found', id)
      return
    }
    _notification.viewedAt = Date.now()
    setUserPreferences(_prefs)
    upsertUserPreferences(() => _prefs)
  }

  const getUnreadNotifications = (type?: NotificationType) => {
    if (isPublicAccount) {
      // TODO: read from localstorage
      return []
    }
    if (!queryRes.data!.notifications) {
      return []
    }
    return queryRes.data!.notifications.filter(
      (_notification) =>
        !_notification.viewedAt &&
        (!type || type === _notification.type) &&
        (!_notification.targetVersion ||
          semver.satisfies(version, _notification.targetVersion))
    )
  }

  // show DIALOG notifications immediately
  getUnreadNotifications(NotificationType.Dialog).forEach((_notification) => {
    notifyHtml(_notification.messageHtml)
    setNotificationRead(_notification.id)
  })

  return (
    <UserPreferencesContext.Provider
      value={{
        getUnreadNotifications,
        setNotificationRead,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  )
}

export const useUserPreferencesContext = () =>
  useContext(UserPreferencesContext)
