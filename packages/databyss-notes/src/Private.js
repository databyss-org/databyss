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
  AuthorsRouter,
  TopicsRouter,
  useNavigationContext,
} from '@databyss-org/ui'
import { View } from '@databyss-org/ui/primitives'

const App = ({ children }) => (
  <View flexDirection="row" display="flex" width="100vw" height="100vh">
    <Sidebar />
    <div style={{ width: '100%' }}>{children}</div>

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
    navigate(`/pages/${account.defaultPage}`)
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
      navigate(`/pages/${account.defaultPage}`)
    }
  }, [])

  return (
    <PageProvider>
      <EntryProvider>
        <SourceProvider>
          <TopicProvider>
            <Router>
              <App path="/">
                <NotFoundRedirect default />
                <PageRouter path="pages/*" />
                <SearchRouter path="search/*" />
                <SourcesRouter path="sources/*" />
                <AuthorsRouter path="authors/*" />
                <TopicsRouter path="topics/*" />
              </App>
            </Router>
          </TopicProvider>
        </SourceProvider>
      </EntryProvider>
    </PageProvider>
  )
}

export default Private
