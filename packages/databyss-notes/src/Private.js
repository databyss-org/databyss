import React, { useEffect } from 'react'
import { Router } from '@reach/router'

import { PageProvider } from '@databyss-org/services'
import { sidebar } from '@databyss-org/ui/theming/components'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { View } from '@databyss-org/ui/primitives'
import EntryProvider from '@databyss-org/services/entries/EntryProvider'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import {
  isMobile,
  ModalManager,
  PageRouter,
  SearchRouter,
  Sidebar,
  SourcesRouter,
  TopicsRouter,
  useNavigationContext,
} from '@databyss-org/ui'

const getStyles = () => {
  const width = isMobile()
    ? `calc(100vw - ${sidebar.collapsedWidth}px)`
    : '100%'
  return { width }
}

const App = ({ children }) => (
  <View
    display="flex"
    flexDirection="row"
    width="100vw"
    height="100vh"
    overflowX="hidden"
  >
    <Sidebar />
    <div style={getStyles()}>{children}</div>

    {/* TODO: replace div with View */}
    {/* <View id="mainid">{children}</View> */}
  </View>
)

const NotFoundRedirect = () => {
  const { navigate } = useNavigationContext()
  const { getSession } = useSessionContext()
  const { account } = getSession()

  // if no page found, navigate to default page
  useEffect(() => {
    navigate(`/${account._id}/pages/${account.defaultPage}`, {
      hasAccount: true,
    })
  }, [])

  return null
}

const Private = () => {
  const { location, navigate } = useNavigationContext()
  const { getSession } = useSessionContext()
  const { account } = getSession()

  // Navigate to default page is nothing in path
  useEffect(() => {
    if (location.pathname === '/') {
      navigate(`/${account._id}/pages/${account.defaultPage}`, {
        hasAccount: true,
      })
    }
  }, [])

  return (
    <PageProvider>
      <EntryProvider>
        <SourceProvider>
          <TopicProvider>
            <Router>
              <App path="/:accountId">
                <NotFoundRedirect default />
                <PageRouter path="pages/*" />
                <SearchRouter path="search/*" />
                <SourcesRouter path="sources/*" />
                <TopicsRouter path="topics/*" />
              </App>
            </Router>
            <ModalManager />
          </TopicProvider>
        </SourceProvider>
      </EntryProvider>
    </PageProvider>
  )
}

export default Private
