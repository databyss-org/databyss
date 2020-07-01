import React, { createContext, useContext } from 'react'
import { Dialog } from '@databyss-org/ui/primitives'
import { ping } from '@databyss-org/services/lib/requestApi'
import {
  NotAuthorizedError,
  NetworkUnavailableError,
} from '@databyss-org/services/interfaces'
import Bugsnag from '@databyss-org/services/lib/bugsnag'
import { formatComponentStack } from '@bugsnag/plugin-react'
import IS_NATIVE from '../../lib/isNative'

const NotifyContext = createContext()

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
    client.BugsnagReport.getStacktrace(error),
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

      window.addEventListener('error', this.showUnhandledErrorDialog)
      window.addEventListener(
        'unhandledrejection',
        this.showUnhandledErrorDialog
      )
    }
  }
  state = {
    dialogVisible: false,
    message: null,
    isOnline: true,
    hasError: false,
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    if (error instanceof NotAuthorizedError) {
      // we don't need to notify, we should be redirecting
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

      window.removeEventListener('error', this.showUnhandledErrorDialog)
      window.removeEventListener(
        'unhandledrejection',
        this.showUnhandledErrorDialog
      )
    }
  }

  onUnhandledError = e => {
    if (e && e.reason instanceof NetworkUnavailableError) {
      this.showOfflineMessage()
      this.checkOnlineStatus()
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
      message: 'Offline, please reconnect.',
      isOnline: false,
    })
  }

  showUnhandledErrorDialog = () => {
    if (this.state.isOnline) {
      this.notify('😥something went wrong')
    }
  }

  checkOnlineStatus() {
    if (!this.state.isOnline) {
      setTimeout(() => {
        ping()
          .then(() => {
            this.setState({
              isOnline: true,
              dialogVisible: false,
            })
          })
          .catch(() => {
            this.checkOnlineStatus()
          })
      }, 1000)
    }
  }

  notify = message => {
    this.setState({
      message,
      dialogVisible: true,
    })
  }

  notifyError = error => {
    this.bugsnagClient.notify(error)
    this.notify(error.message)
  }

  render() {
    const { dialogVisible, message, isOnline } = this.state

    return (
      <NotifyContext.Provider
        value={{ notify: this.notify, notifyError: this.notifyError, isOnline }}
      >
        {!this.state.hasError && this.props.children}
        <Dialog
          showConfirmButton={false}
          visible={dialogVisible}
          message={message}
          onDismiss={() => this.setState({ dialogVisible: false })}
          {...!isOnline && { 'data-test-modal': 'offline' }}
        />
      </NotifyContext.Provider>
    )
  }
}

NotifyProvider.defaultProps = {
  envPrefix: 'REACT_APP',
  options: {},
}

export const useNotifyContext = () => useContext(NotifyContext)

export default NotifyProvider
