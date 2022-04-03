import {
  Notification,
  NotificationType,
  UserPreference,
} from '@databyss-org/data/pouchdb/interfaces'
import semver from 'semver'
import { version } from '@databyss-org/services'
import { useUserPreferences } from '@databyss-org/data/pouchdb/hooks'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { LoadingFallback } from '../../components'
import { useNotifyContext } from '../../components/Notify/NotifyProvider'

export interface UserPreferencesContextType {
  getUnreadNotifications: (type?: NotificationType) => Partial<Notification>[]
  setNotificationRead: (id: string) => void
  setPreferredCitationStyle: (style: string) => void
  getPreferredCitationStyle: () => string
  userPreferences: UserPreference
}

export const UserPreferencesContext = createContext<UserPreferencesContextType>(
  null!
)

export const UserPreferencesProvider = ({ children }) => {
  const [queryRes, setUserPreferences] = useUserPreferences()
  const { notifyConfirm } = useNotifyContext() ?? {}
  const isPublicAccount =
    useSessionContext((c) => c && c.isPublicAccount) ?? (() => false)
  const [renderChildren, setRenderChildren] = useState(false)

  const userPreferences = queryRes.data! as UserPreference

  const setNotificationRead = (id: string) => {
    if (isPublicAccount()) {
      // TODO: save read history to localstorage
      return
    }
    const _notification = userPreferences.notifications?.find(
      (_n) => _n.id === id
    )
    if (!_notification) {
      console.error('Notification not found', id)
      return
    }
    _notification.viewedAt = Date.now()
    setUserPreferences(userPreferences)
  }

  const getUnreadNotifications = (type?: NotificationType) => {
    if (!userPreferences?.notifications) {
      return []
    }
    return userPreferences.notifications.filter((_notification) => {
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
    // console.log('[UserPreferencesProvider] Process notifications...')
    const _notification = _notifications[0]
    if (_notification) {
      switch (_notification.type) {
        case NotificationType.Dialog: {
          setRenderChildren(true)
          notifyConfirm({
            html: true,
            message: _notification.messageHtml,
            onOk: () => {
              setNotificationRead(_notification.id!)
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
              setNotificationRead(_notification.id!)
              setTimeout(() => window.location.reload(), 500)
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

  const setPreferredCitationStyle = (styleId: string) => {
    // error checks
    const typeOfStyleId = typeof styleId
    if (typeOfStyleId !== 'string') {
      throw new Error(
        `setPreferredCitationStyle() expected 'styleId' to be a string.
          Received "${typeOfStyleId}".`
      )
    }
    userPreferences.preferredCitationStyle = styleId
    setUserPreferences(userPreferences)
  }

  const getPreferredCitationStyle = () =>
    userPreferences?.preferredCitationStyle ?? 'mla'

  if (!queryRes.isSuccess) {
    return <LoadingFallback queryObserver={queryRes} />
  }

  return (
    <UserPreferencesContext.Provider
      value={{
        getUnreadNotifications,
        setNotificationRead,
        setPreferredCitationStyle,
        getPreferredCitationStyle,
        userPreferences,
      }}
    >
      {renderChildren ? children : null}
    </UserPreferencesContext.Provider>
  )
}

export const useUserPreferencesContext = () =>
  useContext(UserPreferencesContext)
