import React, { createContext, useContext } from 'react'
import { Dialog, Button } from '@databyss-org/ui/primitives'
import { ping } from '@databyss-org/services/lib/requestApi'
import {
  NotAuthorizedError,
  NetworkUnavailableError,
  VersionConflictError,
  InsufficientPermissionError,
  ResourceNotFoundError,
} from '@databyss-org/services/interfaces'
import Bugsnag from '@databyss-org/services/lib/bugsnag'
import { formatComponentStack } from '@bugsnag/plugin-react'
import IS_NATIVE from '../../lib/isNative'

const CHECK_ONLINE_INTERVAL = 3000

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
export const makeBugsnagReport = (client, error, info) => {
  const handledState = {
    severity: 'error',
    unhandled: true,
    severityReason: { type: 'unhandledException' },
  }
  const report = new client.BugsnagReport(
    error.name,
    error.message,
    client.BugsnagReport?.getStacktrace(error),
    handledState,
    error
  )
  if (info && info.componentStack) {
    info.componentStack = formatComponentStack(info.componentStack)
  }
  report.updateMetaData('react', info)
  return report
}

// TODO: update to functional component when `componentDidCatch` hook is added
class NotifyProvider extends React.Component {
  constructor(props) {
    super(props)
    this.bugsnagClient = Bugsnag.init(props.options)

    if (IS_NATIVE) {
      global.ErrorUtils.setGlobalHandler(error => {
        this.bugsnagClient.notify(error)
        this.showUnhandledErrorDialog()
        console.error(error)
      })
    } else {
      window.addEventListener('offline', () => this.setOnlineStatus(false))
      window.addEventListener('online', () => this.setOnlineStatus(true))
      window.addEventListener('error', this.onUnhandledError)
      window.addEventListener('unhandledrejection', this.onUnhandledError)
      window.addEventListener('focus', this.onWindowFocus)
    }
  }
  state = {
    dialogVisible: false,
    message: null,
    isOnline: true,
    hasError: false,
    html: false,
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    if (error instanceof VersionConflictError) {
      window.location.reload()
      return
    }
    if (
      instanceofAny(
        [error],
        [NotAuthorizedError, InsufficientPermissionError, ResourceNotFoundError]
      )
    ) {
      // we don't need to notify, we should be showing authwall, 403 or 404
      return
    }
    this.bugsnagClient.notify(
      IS_NATIVE ? error : makeBugsnagReport(this.bugsnagClient, error, info)
    )
    this.showUnhandledErrorDialog()
  }

  componentWillUnmount() {
    if (!IS_NATIVE) {
      window.removeEventListener('offline', this.setOnlineStatus)
      window.removeEventListener('online', this.setOnlineStatus)
      window.removeEventListener('error', this.onUnhandledError)
      window.removeEventListener('unhandledrejection', this.onUnhandledError)
      window.removeEventListener('focus', this.onWindowFocus)
    }
  }

  onWindowFocus = () => {
    ping().catch(this.onUnhandledError)
  }

  onUnhandledError = e => {
    // HACK: ignore ResizeObserver loop limit errors, which are more like warnings
    //   (see https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded)
    if (e === 'ResizeObserver loop limit exceeded') {
      return
    }

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
      window.location.reload()
      return
    }
    if (
      e &&
      instanceofAny([e, e.reason, e.error], [NetworkUnavailableError]) &&
      this.state.isOnline
    ) {
      this.showOfflineMessage()
      this.checkOnlineStatus()
    } else {
      this.showUnhandledErrorDialog()
    }
  }

  setOnlineStatus = isOnline => {
    if (!isOnline) {
      this.showOfflineMessage()
    } else {
      this.setState({
        isOnline,
        dialogVisible: false,
      })
    }
  }

  showOfflineMessage = () => {
    this.setState({
      dialogVisible: true,
      message:
        "Offline, please reconnect.\n Your changes will be saved when you are back online, so don't reload the page.",
      isOnline: false,
    })
  }

  showUnhandledErrorDialog = () => {
    if (this.state.isOnline) {
      this.notify('😱 So sorry, but Databyss has encountered an error.', true)
    }
  }

  checkOnlineStatus() {
    if (!this.state.isOnline) {
      ping(CHECK_ONLINE_INTERVAL)
        .then(() => {
          this.setState({
            isOnline: true,
            dialogVisible: false,
          })
        })
        .catch(() => {
          this.checkOnlineStatus()
        })
    }
  }

  notify = (message, _error, _html) => {
    this.setState({
      message,
      html: _html,
      dialogVisible: true,
      ...(_error
        ? {
            hasError: true,
          }
        : {}),
    })
  }

  notifyError = error => {
    this.bugsnagClient.notify(error)
    this.notify(error.message, error)
  }

  notifyHtml = message => {
    this.notify(message, null, true)
  }

  render() {
    const { dialogVisible, message, isOnline, html } = this.state
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
      <Button key="ok" onPress={() => window.location.reload()}>
        Refresh and try again
      </Button>,
    ]

    return (
      <NotifyContext.Provider
        value={{
          notify: this.notify,
          notifyError: this.notifyError,
          notifyHtml: this.notifyHtml,
          isOnline,
        }}
      >
        {!this.state.hasError && this.props.children}
        <Dialog
          showConfirmButtons={this.state.isOnline}
          confirmButtons={this.state.hasError ? errorConfirmButtons : []}
          onConfirm={() => this.setState({ dialogVisible: false })}
          visible={dialogVisible}
          message={message}
          html={html}
          {...!isOnline && { 'data-test-modal': 'offline' }}
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
