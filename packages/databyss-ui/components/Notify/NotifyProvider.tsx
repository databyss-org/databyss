import React, { createContext, ReactNode, useContext } from 'react'
import { Dialog, Button, Text, View } from '@databyss-org/ui/primitives'
import {
  NotAuthorizedError,
  NetworkUnavailableError,
  VersionConflictError,
  InsufficientPermissionError,
  ResourceNotFoundError,
} from '@databyss-org/services/interfaces'
import Bugsnag, { BrowserConfig } from '@bugsnag/js'
import { startBugsnag } from '@databyss-org/services/lib/bugsnag'
import { formatComponentStack } from '@bugsnag/plugin-react'
import { checkNetwork } from '@databyss-org/services/lib/request'
import { cleanupDefaultGroup } from '@databyss-org/services/session/clientStorage'
import IS_NATIVE from '../../lib/isNative'
import StickyMessage from './StickyMessage'

declare module '@bugsnag/plugin-react' {
  export const formatComponentStack: (str: string) => string
}

export interface DialogOptions {
  message?: string | null
  visible?: boolean
  html?: boolean
  error?: boolean
  buttons?: ReactNode[] | null
  okText?: string | null
  cancelText?: string | null
  onOk?: () => void
  onCancel?: () => void
  showConfirmButtons?: boolean
}

export interface StickyOptions {
  visible?: boolean
  children?: ReactNode | null
}

interface NotifyProviderState {
  dialog: DialogOptions
  sticky: StickyOptions
  isOnline: boolean
  hasError: boolean
}

interface ContextType {
  notify: (options: DialogOptions) => void
  notifyError: (options: DialogOptions) => void
  notifyHtml: (options: DialogOptions) => void
  notifySticky: (options: StickyOptions) => void
  notifyConfirm: (options: DialogOptions) => void
  hideDialog: () => void
  hideSticky: () => void
  isOnline: boolean
}

const NotifyContext = createContext<ContextType>(null!)

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

interface NotifyProviderProps {
  envPrefix?: string
  bugsnagOptions?: Partial<BrowserConfig>
}

const initialDialogState: DialogOptions = {
  visible: false,
  message: null,
  html: false,
  buttons: null,
  showConfirmButtons: true,
}
const initialStickyState: StickyOptions = {
  visible: false,
  children: null,
}

// TODO: update to functional component when `componentDidCatch` hook is added
class NotifyProvider extends React.Component {
  constructor(props: NotifyProviderProps) {
    super(props)
    startBugsnag(props.bugsnagOptions ?? {})

    // native fails TS
    // if (IS_NATIVE) {
    //   global.ErrorUtils.setGlobalHandler((error) => {
    //     Bugsnag.notify(error)
    //     this.showUnhandledErrorDialog()
    //     console.error(error)
    //   })
    // } else {
    window.addEventListener('offline', () => this.setOnlineStatus(false))
    window.addEventListener('online', () => this.setOnlineStatus(true))
    window.addEventListener('error', this.onUnhandledError)
    window.addEventListener('unhandledrejection', this.onUnhandledError)

    // check for service worker cache updates
    this.checkForUpdates()

    // poll for online status
    this.checkOnlineStatusTimer = window.setInterval(
      this.checkOnlineStatus,
      parseInt(process.env.FETCH_TIMEOUT!, 10) || 5000
    )
    // }
  }
  state: NotifyProviderState = {
    dialog: initialDialogState,
    sticky: initialStickyState,
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

  onUnhandledError = (e: any, ...info) => {
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

  checkOnlineStatusTimer: number

  notifyUpdateAvailable = () => {
    this.notifySticky({
      children: (
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
      ),
    })
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

      window.setInterval(
        () =>
          reg.update().catch((err) => {
            console.log('reg.update error', err)
          }),
        parseInt(process.env.VERSION_POLL_INTERVAL!, 10) || 300000
      )
    })
  }

  showUnhandledErrorDialog = () => {
    this.notify({
      message: '😱 So sorry, but Databyss has encountered an error.',
      error: true,
    })
  }

  checkOnlineStatus = () => {
    checkNetwork().then((isOnline) => {
      this.setOnlineStatus(isOnline)
    })
  }

  notify = (options: DialogOptions) => {
    this.setState({
      dialog: {
        ...options,
        visible: true,
      },
    })
  }

  notifyConfirm = (options: DialogOptions) => {
    const { okText, cancelText, onOk, onCancel } = options
    const buttons = [
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
    this.notify({
      buttons,
      ...options,
    })
  }

  notifySticky = (options: StickyOptions) => {
    this.setState({
      sticky: {
        ...options,
        visible: true,
      },
    })
  }

  hideDialog = () => {
    this.setState({
      dialog: initialDialogState,
    })
  }

  hideSticky = () => {
    this.setState({
      sticky: initialStickyState,
    })
  }

  notifyError = (error: Error) => {
    Bugsnag.notify(error)
    this.notify({
      message: error.message,
      error: true,
    })
  }

  notifyHtml = (options: DialogOptions) => {
    this.notify({
      ...options,
      html: true,
    })
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
          hideDialog: this.hideDialog,
          hideSticky: this.hideSticky,
          isOnline,
        }}
      >
        <StickyMessage visible={sticky.visible}>
          <View flexDirection="row" alignItems="center">
            {sticky.children}
          </View>
        </StickyMessage>
        {!this.state.hasError && this.props.children}
        <Dialog
          showConfirmButtons={dialog.showConfirmButtons}
          confirmButtons={
            this.state.hasError ? errorConfirmButtons : dialog.buttons || []
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

export const useNotifyContext = () => useContext(NotifyContext)

export default NotifyProvider
