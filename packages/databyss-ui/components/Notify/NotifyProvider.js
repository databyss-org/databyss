import React, { createContext, useContext } from 'react'
import { Dialog } from '@databyss-org/ui/primitives'
import { UnauthorizedError } from '@databyss-org/services/lib/request'
import bugsnag from '@databyss-org/services/lib/bugsnag'
import { formatComponentStack } from '@bugsnag/plugin-react'

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
    this.bugsnagClient = bugsnag(`REACT_APP_${this.props.envPrefix}`)
    window.addEventListener('error', this.showUnhandledErrorDialog)
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
      makeBugsnagReport(this.bugsnagClient, error, info)
    )
    this.showUnhandledErrorDialog()
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

  notifyError = message => {
    this.bugsnagClient.notify(message)
    this.notify(message)
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

export const useNotifyContext = () => useContext(NotifyContext)

export default NotifyProvider
