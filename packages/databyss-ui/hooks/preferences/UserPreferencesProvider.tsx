import {
  Notification,
  NotificationType,
  UserPreference,
} from '@databyss-org/data/pouchdb/interfaces'
import semver from 'semver'
import { version } from '@databyss-org/services'
import { useUserPreferences } from '@databyss-org/data/pouchdb/hooks'
import {
  updateGroupPreferences,
  upsertUserPreferences,
} from '@databyss-org/data/pouchdb/utils'
import React, { createContext, useContext, useEffect, useState } from 'react'
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
  const { notifyConfirm } = useNotifyContext()
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const [renderChildren, setRenderChildren] = useState(false)

  const setNotificationRead = (id: string) => {
    if (isPublicAccount()) {
      // TODO: save read history to localstorage
      return
    }
    const _prefs = queryRes.data! as UserPreference
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
    if (!queryRes.data?.notifications) {
      return []
    }
    return queryRes.data!.notifications.filter((_notification) => {
      if (type && type !== _notification.type) {
        return false
      }
      switch (_notification.type) {
        case NotificationType.Dialog: {
          if (isPublicAccount()) {
            // TODO: add a `public` flag to Notification
            //   but we need to save read history to localstorage for this to work
            //   because group sync is downstream only for public pages/groups
            return false
          }
          return (
            !_notification.viewedAt &&
            (!_notification.targetVersion ||
              semver.satisfies(version, _notification.targetVersion))
          )
        }
        case NotificationType.ForceUpdate: {
          return semver.satisfies(version, _notification.targetVersion)
        }
      }
      return true
    })
  }

  // show DIALOG notifications immediately
  const _notifications = getUnreadNotifications()
  useEffect(() => {
    console.log('[UserPreferencesProvider] Process notifications...')
    const _notification = _notifications[0]
    if (_notification) {
      switch (_notification.type) {
        case NotificationType.Dialog: {
          setRenderChildren(true)
          notifyConfirm({
            html: true,
            message: _notification.messageHtml,
            onOk: () => {
              setNotificationRead(_notification.id)
            },
            showCancelButton: false,
          })
          break
        }
        case NotificationType.ForceUpdate: {
          setRenderChildren(false)
          notifyConfirm({
            html: true,
            message: _notification.messageHtml,
            onOk: () => {
              setNotificationRead(_notification.id)
              setTimeout(() => window.location.reload(true), 500)
            },
            showCancelButton: false,
          })
          break
        }
        default: {
          setRenderChildren(true)
        }
      }
    } else {
      setRenderChildren(true)
    }
  }, [JSON.stringify(_notifications)])

  if (!queryRes.isSuccess) {
    return <LoadingFallback queryObserver={queryRes} />
  }

  return (
    <UserPreferencesContext.Provider
      value={{
        getUnreadNotifications,
        setNotificationRead,
      }}
    >
      {renderChildren ? children : null}
    </UserPreferencesContext.Provider>
  )
}

export const useUserPreferencesContext = () =>
  useContext(UserPreferencesContext)
