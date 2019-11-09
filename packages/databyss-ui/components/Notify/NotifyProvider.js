import React, { createContext, useContext } from 'react'
import { Dialog } from '@databyss-org/ui/primitives'
import { UnauthorizedError } from '@databyss-org/services/lib/request'
import bugsnag from '@databyss-org/services/lib/bugsnag'

const NotifyContext = createContext()

// TODO: update to functional component when `componentDidCatch` hook is added
class NotifyProvider extends React.Component {
  constructor(props) {
    super(props)
    this.bugsnagClient = bugsnag(`REACT_APP_${this.props.envPrefix}`)
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
    this.bugsnagClient.notify(error, {
      beforeSend: report => {
        report.metaData = info || error.info
      },
    })
    this.setState({
      dialogVisible: true,
      message: '😥something went wrong',
      errorWasCaught: true,
    })
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
    const { dialogVisible, message, errorWasCaught } = this.state
    return (
      <NotifyContext.Provider
        value={{ notify: this.notify, notifyError: this.notifyError }}
      >
        {!errorWasCaught && this.props.children}
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
