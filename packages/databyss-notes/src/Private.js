import React from 'react'
import { Router } from '@reach/router'
import { PageProvider } from '@databyss-org/services'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import EntryProvider from '@databyss-org/services/entries/EntryProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { Sidebar, PageContent, Page, SearchRouter } from '@databyss-org/ui'
import { View } from '@databyss-org/ui/primitives'

// let Page = () => <div>sucks</div>

let App = ({ children }) => (
  <View flexDirection="row" display="flex" width="100vw" height="100vh">
    <Sidebar />
    <div style={{ width: '100%' }}>{children}</div>
    {/* TODO: replace div with View */}
    {/* <View id="mainid">{children}</View> */}
  </View>
)

const Private = () => {
  const { path, getTokensFromPath } = useNavigationContext()
  const { type } = getTokensFromPath()

  return (
    <PageProvider>
      <EntryProvider>
        <SourceProvider>
          <TopicProvider>
            <View
              flexDirection="row"
              display="flex"
              width="100vw"
              flex="1"
              height="100vh"
            >
              <Router>
                <App path="/">
                  <Page path="pages">
                    <PageContent path=":id" key={path} />
                  </Page>
                  <SearchRouter path="search/*" />
                </App>
              </Router>
            </View>
          </TopicProvider>
        </SourceProvider>
      </EntryProvider>
    </PageProvider>
  )
}

export default Private
