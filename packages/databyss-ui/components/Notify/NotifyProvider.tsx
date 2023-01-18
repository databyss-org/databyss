import React, { ReactNode } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
import {
  Dialog,
  Button,
  Text,
  View,
  RawHtml,
} from '@databyss-org/ui/primitives'
import LoadingIcon from '@databyss-org/ui/assets/loading.svg'
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
import { cleanupGroupFromUrl } from '@databyss-org/services/session/clientStorage'
import IS_NATIVE from '../../lib/isNative'
import StickyMessage from './StickyMessage'
import { UnauthorizedDatabaseReplication } from '../../../databyss-services/interfaces/Errors'

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
  showCancelButton?: boolean
  dolphins?: boolean
  nude?: boolean
}

export interface StickyOptions {
  visible?: boolean
  backgroundTask?: boolean
  message?: string
  children?: ReactNode | null
}

interface NotifyProviderState {
  dialog: DialogOptions
  sticky: StickyOptions
  isOnline: boolean
  hasError: boolean
  hideApplication: boolean
}

interface ContextType {
  notify: (options: DialogOptions) => void
  notifyError: (error: Error) => void
  notifyHtml: (options: DialogOptions) => void
  notifySticky: (options: StickyOptions) => void
  notifyConfirm: (options: DialogOptions) => void
  notifyBackgroundTask: (message: string) => void
  hideDialog: () => void
  hideSticky: () => void
  hideApplication: () => void
  showApplication: () => void
  notifyUpdateAvailable: () => void
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
  nude: false,
}
const initialStickyState: StickyOptions = {
  visible: false,
  children: null,
}

// Global last error to avoid logging duplicates
let lastErrorLogged: Error | null = null

// TODO: update to functional component when `componentDidCatch` hook is added
class NotifyProvider extends React.Component {
  constructor(props: NotifyProviderProps) {
    super(props)
    const _options = props.bugsnagOptions ?? {}
    _options.endpoints = {
      sessions: `${process.env.API_URL}/log/sessions`,
      notify: `${process.env.API_URL}/log/notify`,
    }
    startBugsnag(_options)

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

    // poll for online status
    this.checkOnlineStatusTimer = window.setInterval(
      this.checkOnlineStatus,
      parseInt(process.env.FETCH_TIMEOUT!, 10) || 5000
    )
    this.checkOnlineStatus()
    // }
  }
  state: NotifyProviderState = {
    dialog: initialDialogState,
    sticky: initialStickyState,
    isOnline: true,
    hasError: false,
    hideApplication: false,
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidMount() {
    // check for service worker cache updates
    this.checkForUpdates()
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
      e &&
      instanceofAny([e, e.reason, e.error], [UnauthorizedDatabaseReplication])
    ) {
      console.log('[UnauthorizedDatabaseReplication]', e)
      cleanupGroupFromUrl().then(() => {
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

    let _bserr = e
    if (!(e instanceof Error)) {
      _bserr = e.error
    }
    if (!(e instanceof Error)) {
      _bserr = e.reason
    }

    if (
      _bserr instanceof Error &&
      _bserr.message !== lastErrorLogged?.message
    ) {
      lastErrorLogged = _bserr
      if (IS_NATIVE) {
        Bugsnag.notify(e)
      } else {
        Bugsnag.notify(e, (event) => {
          enhanceBugsnagEvent(event, info)
        })
      }
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
          <Text variant="uiTextNormal">There is a new version available!</Text>
          <Button
            ml="small"
            variant="uiLink"
            textVariant="uiTextNormal"
            href="/g_7v9n4vjx2h7511/pages/iku2iiu2d16y33"
            target="_blank"
          >
            See what&apos;s new
          </Button>
          <Button
            ml="small"
            variant="uiLink"
            textVariant="uiTextNormal"
            onPress={() => window.location.reload()}
          >
            Refresh or click here to update
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

  notifyConfirm = ({
    okText = 'Ok',
    cancelText = 'Cancel',
    showCancelButton = true,
    onOk,
    onCancel,
    ...options
  }: DialogOptions) => {
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
    ]
    if (showCancelButton) {
      _buttons.push(
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
        </Button>
      )
    }
    this.notify({
      buttons: _buttons,
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

  notifyBackgroundTask = (message: string) => {
    this.setState({
      sticky: {
        backgroundTask: true,
        message,
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

  hideApplication = () => {
    if (process.env.NODE_ENV === 'test' || process.env.STORYBOOK) {
      return
    }
    ;(window as any).startdatabyss()
    this.setState({
      hideApplication: true,
    })
  }

  showApplication = () => {
    if (process.env.NODE_ENV === 'test' || process.env.STORYBOOK) {
      return
    }
    ;(window as any).stopdatabyss()
    this.setState({
      hideApplication: false,
    })
  }

  render() {
    const { dialog, sticky, isOnline } = this.state
    const errorConfirmButtons = [
      <Button
        key="help"
        variant="uiLink"
        alignItems="center"
        href="https://discord.gg/KKrjNdwV7K"
        target="_blank"
      >
        Discord Support Channel
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
          notifySticky: this.notifySticky,
          notifyConfirm: this.notifyConfirm,
          notifyBackgroundTask: this.notifyBackgroundTask,
          hideDialog: this.hideDialog,
          hideSticky: this.hideSticky,
          showApplication: this.showApplication,
          hideApplication: this.hideApplication,
          notifyUpdateAvailable: this.notifyUpdateAvailable,
          isOnline,
        }}
      >
        <StickyMessage
          visible={sticky.visible}
          canDismiss={!sticky.backgroundTask}
          rightAlignChildren={
            sticky.backgroundTask ? (
              <LoadingIcon width={20} height={20} />
            ) : null
          }
        >
          <View flexDirection="row" alignItems="center">
            {sticky.message ? (
              <Text variant="uiTextNormal">{sticky.message}</Text>
            ) : (
              sticky.children
            )}
          </View>
        </StickyMessage>
        <View
          width="100%"
          overflow="hidden"
          flexShrink={1}
          flexGrow={1}
          backgroundColor="background.1"
          opacity={this.state.hideApplication ? 0 : 1}
          css={{
            transition: 'opacity 200ms ease',
          }}
        >
          {!this.state.hasError && this.props.children}
        </View>
        {dialog.visible && dialog.nude && (
          <View position="absolute" bottom="extraLarge">
            {dialog.html ? (
              <RawHtml
                color="gray.4"
                variant="uiTextLargeSemibold"
                html={dialog.message!}
              />
            ) : (
              <Text color="gray.4" variant="uiTextLargeSemibold">
                {dialog.message}
              </Text>
            )}
          </View>
        )}
        <Dialog
          showConfirmButtons={dialog.showConfirmButtons}
          confirmButtons={
            this.state.hasError ? errorConfirmButtons : dialog.buttons || []
          }
          onConfirm={() => this.hideDialog()}
          visible={dialog.visible && !dialog.nude}
          message={dialog.message}
          html={dialog.html}
          dolphins={dialog.dolphins}
          {...(!isOnline && { 'data-test-modal': 'offline' })}
        />
      </NotifyContext.Provider>
    )
  }
}

export const useNotifyContext = (selector = (x) => x) =>
  useContextSelector(NotifyContext, selector)

export default NotifyProvider
