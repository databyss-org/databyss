import React, { createContext, useContext } from 'react'
import { Dialog } from '@databyss-org/ui/primitives'
import { UnauthorizedError } from '@databyss-org/services/lib/request'
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
    this.bugsnagClient = Bugsnag.init(props.envPrefix, props.options)

    if (IS_NATIVE) {
      global.ErrorUtils.setGlobalHandler(error => {
        this.bugsnagClient.notify(error)
        this.showUnhandledErrorDialog()
        console.error(error)
      })
    } else {
      window.addEventListener('error', this.showUnhandledErrorDialog)
    }
  }
  state = {
    dialogVisible: false,
    message: null,
  }

  componentDidCatch(error, info) {
    if (error instanceof UnauthorizedError) {
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
      window.removeEventListener('error', this.showUnhandledErrorDialog)
    }
  }

  showUnhandledErrorDialog = () => {
    this.notify('😥something went wrong')
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
    const { dialogVisible, message } = this.state
    return (
      <NotifyContext.Provider
        value={{ notify: this.notify, notifyError: this.notifyError }}
      >
        {this.props.children}
        <Dialog
          visible={dialogVisible}
          message={message}
          onDismiss={() => this.setState({ dialogVisible: false })}
        />
      </NotifyContext.Provider>
    )
  }
}

NotifyProvider.defaultProps = {
  envPrefix: '',
  options: {},
}

export const useNotifyContext = () => useContext(NotifyContext)

export default NotifyProvider
