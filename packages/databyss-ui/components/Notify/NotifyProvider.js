import React, { createContext, useContext } from 'react'
import { Dialog, Button, Text, View } from '@databyss-org/ui/primitives'
import {
  NotAuthorizedError,
  NetworkUnavailableError,
  VersionConflictError,
  InsufficientPermissionError,
  ResourceNotFoundError,
} from '@databyss-org/services/interfaces'
import Bugsnag from '@bugsnag/js'
import { startBugsnag } from '@databyss-org/services/lib/bugsnag'
import { formatComponentStack } from '@bugsnag/plugin-react'
import { checkNetwork } from '@databyss-org/services/lib/request'
import { cleanupDefaultGroup } from '@databyss-org/services/session/clientStorage'
import IS_NATIVE from '../../lib/isNative'
import StickyMessage from './StickyMessage'

const NotifyContext = createContext()

const instanceofAny = (objs, types) => {
  for (const obj of objs) {
    for (const t of types) {
      if (obj instanceof t) {
        return true
      }
    }
  }
  return false
}

// from @bugsnag/plugin-react
export const enhanceBugsnagEvent = (event, info) => {
  event.handledState = {
    severity: 'error',
    unhandled: true,
    severityReason: { type: 'unhandledException' },
  }
  if (info && info.componentStack)
    info.componentStack = formatComponentStack(info.componentStack)
  event.addMetadata('react', info)
}

// TODO: update to functional component when `componentDidCatch` hook is added
class NotifyProvider extends React.Component {
  constructor(props) {
    super(props)
    startBugsnag(props.options)

    if (IS_NATIVE) {
      global.ErrorUtils.setGlobalHandler((error) => {
        Bugsnag.notify(error)
        this.showUnhandledErrorDialog()
        console.error(error)
      })
    } else {
      window.addEventListener('offline', () => this.setOnlineStatus(false))
      window.addEventListener('online', () => this.setOnlineStatus(true))
      window.addEventListener('error', this.onUnhandledError)
      window.addEventListener('unhandledrejection', this.onUnhandledError)

      // check for service worker cache updates
      this.checkForUpdates()

      // poll for online status
      setInterval(this.checkOnlineStatus, process.env.FETCH_TIMEOUT)
    }
  }
  state = {
    dialog: {
      visible: false,
      message: null,
      html: false,
      buttons: null,
    },
    sticky: {
      visible: false,
      html: false,
      children: null,
    },
    isOnline: true,
    hasError: false,
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    this.onUnhandledError(error, info)
  }

  componentWillUnmount() {
    if (!IS_NATIVE) {
      window.removeEventListener('offline', this.setOnlineStatus)
      window.removeEventListener('online', this.setOnlineStatus)
      window.removeEventListener('error', this.onUnhandledError)
      window.removeEventListener('unhandledrejection', this.onUnhandledError)
      // window.removeEventListener('focus', this.onWindowFocus)

      window.clearInterval(this.checkOnlineStatusTimer)
    }
  }

  onUnhandledError = (e, info) => {
    // HACK: ignore ResizeObserver loop limit errors, which are more like warnings
    //   (see https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded)
    if (e === 'ResizeObserver loop limit exceeded') {
      return
    }

    // handle pouch "access denied" by deleting pouchdb for default group
    //   and redirecting to login
    if (
      e.reason?.constructor?.name === 'PouchError' &&
      e.reason?.name === 'forbidden'
    ) {
      cleanupDefaultGroup().then(() => {
        window.location.pathname = '/'
      })
      return
    }

    if (e && instanceofAny([e, e.reason, e.error], [NetworkUnavailableError])) {
      if (this.state.isOnline) {
        this.setOnlineStatus(false)
      }
      return
    }

    this.setOnlineStatus(true)

    if (
      e &&
      instanceofAny(
        [e, e.reason, e.error],
        [NotAuthorizedError, InsufficientPermissionError, ResourceNotFoundError]
      )
    ) {
      // we don't need to notify, we should be showing authwall, 403 or 404
      return
    }
    if (e && instanceofAny([e, e.reason, e.error], [VersionConflictError])) {
      this.notifyUpdateAvailable()
      return
    }

    if (IS_NATIVE) {
      Bugsnag.notify(e)
    } else {
      Bugsnag.notify(e, (event) => {
        enhanceBugsnagEvent(event, info)
      })
    }

    this.showUnhandledErrorDialog()
  }

  setOnlineStatus = (isOnline) => {
    this.setState({
      isOnline,
    })
  }

  notifyUpdateAvailable = () => {
    this.notifySticky(
      <>
        <Text variant="uiTextSmall">There is a new version available!</Text>
        <Button
          ml="small"
          variant="uiLink"
          textVariant="uiTextSmall"
          href={window.location.href}
          onPress={() => window.location.reload(true)}
        >
          Click here to update
        </Button>
      </>
    )
  }

  checkForUpdates = () => {
    if (
      process.env.NODE_ENV !== 'production' ||
      !('serviceWorker' in navigator)
    ) {
      return
    }
    navigator.serviceWorker.ready.then((reg) => {
      reg.addEventListener('updatefound', this.notifyUpdateAvailable)

      setInterval(
        () =>
          reg.update().catch((err) => {
            console.log('reg.update error', err)
          }),
        process.env.VERSION_POLL_INTERVAL
      )
    })
  }

  showUnhandledErrorDialog = () => {
    this.notify('😱 So sorry, but Databyss has encountered an error.', true)
  }

  checkOnlineStatus = () => {
    checkNetwork().then((isOnline) => {
      this.setOnlineStatus(isOnline)
    })
  }

  notify = (message, _error, _html, _buttons) => {
    this.setState({
      dialog: {
        visible: true,
        message,
        html: _html,
        buttons: _buttons,
      },
      ...(_error
        ? {
            hasError: true,
          }
        : {}),
    })
  }

  notifyConfirm = ({ message, okText, cancelText, onOk, onCancel }) => {
    const _buttons = [
      <Button
        key="notifyConfirmOk"
        onPress={() => {
          if (onOk) {
            onOk()
          }
          this.hideDialog()
        }}
      >
        {okText}
      </Button>,
      <Button
        variant="secondaryUi"
        key="notifyConfirmCancel"
        onPress={() => {
          if (onCancel) {
            onCancel()
          }
          this.hideDialog()
        }}
      >
        {cancelText}
      </Button>,
    ]
    this.notify(message, false, false, _buttons)
  }

  notifyStickyHtml = (html) => {
    this.setState({
      sticky: {
        visible: true,
        html,
      },
    })
  }

  notifySticky = (children) => {
    this.setState({
      sticky: {
        visible: true,
        html: false,
        children,
      },
    })
  }

  hideDialog = () => {
    this.setState({
      dialog: {
        ...this.state.dialog,
        visible: false,
      },
    })
  }

  notifyError = (error) => {
    Bugsnag.notify(error)
    this.notify(error.message, error)
  }

  notifyHtml = (message) => {
    this.notify(message, null, true)
  }

  render() {
    const { dialog, sticky, isOnline } = this.state
    const errorConfirmButtons = [
      <Button
        key="help"
        variant="uiLink"
        alignItems="center"
        href="https://forms.gle/z5Jcp4WK8MCwfpzy7"
        target="_blank"
      >
        Support Request Form
      </Button>,
      <Button key="ok" onPress={() => window.location.reload(true)}>
        Refresh and try again
      </Button>,
    ]

    return (
      <NotifyContext.Provider
        value={{
          notify: this.notify,
          notifyError: this.notifyError,
          notifyHtml: this.notifyHtml,
          notifySticky: this.notifySticky,
          notifyConfirm: this.notifyConfirm,
          isOnline,
        }}
      >
        <StickyMessage visible={sticky.visible}>
          <View flexDirection="horizontal" alignItems="center">
            {sticky.children}
          </View>
        </StickyMessage>
        {!this.state.hasError && this.props.children}
        <Dialog
          showConfirmButtons
          confirmButtons={
            this.state.hasError
              ? errorConfirmButtons
              : this.state.dialog.buttons || []
          }
          onConfirm={() => this.hideDialog()}
          visible={dialog.visible}
          message={dialog.message}
          html={dialog.html}
          {...(!isOnline && { 'data-test-modal': 'offline' })}
        />
      </NotifyContext.Provider>
    )
  }
}

NotifyProvider.defaultProps = {
  options: {},
}

export const useNotifyContext = () => useContext(NotifyContext)

export default NotifyProvider
