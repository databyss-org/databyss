import React from 'react'
import { Router } from '@reach/router'
import { PageProvider } from '@databyss-org/services'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import EntryProvider from '@databyss-org/services/entries/EntryProvider'
import { Sidebar, PageRouter, SearchRouter } from '@databyss-org/ui'
import { View } from '@databyss-org/ui/primitives'

const App = ({ children }) => (
  <View flexDirection="row" display="flex" width="100vw" height="100vh">
    <Sidebar />
    <div style={{ width: '100%' }}>{children}</div>

    {/* TODO: replace div with View */}
    {/* <View id="mainid">{children}</View> */}
  </View>
)

const Private = () => (
  <PageProvider>
    <EntryProvider>
      <SourceProvider>
        <TopicProvider>
          <Router>
            <App path="/">
              <PageRouter path="pages/*" />
              <SearchRouter path="search/*" />
            </App>
          </Router>
        </TopicProvider>
      </SourceProvider>
    </EntryProvider>
  </PageProvider>
)

export default Private
