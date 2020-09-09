import React, { useEffect } from 'react'
import { Router } from '@reach/router'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { PageProvider } from '@databyss-org/services'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import EntryProvider from '@databyss-org/services/entries/EntryProvider'
import {
  Sidebar,
  PageRouter,
  SearchRouter,
  SourcesRouter,
  TopicsRouter,
  useNavigationContext,
  ModalManager,
} from '@databyss-org/ui'
import { sidebarTotalWidth } from '@databyss-org/ui/theming/components'
import { View } from '@databyss-org/ui/primitives'

const App = ({ children }) => (
  <View flexDirection="row" display="flex" width="100vw" minHeight="100vh">
    <Sidebar />
    <View id="mainid" ml={sidebarTotalWidth} flex="1" width="100%">
      {children}
    </View>
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
            <Router width="100%">
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
