import React, { useState } from 'react'
import { Redirect, Router } from '@reach/router'

import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { View } from '@databyss-org/ui/primitives'

import NavBar from '../components/NavBar'
import Tabs from '../constants/Tabs'

import PagesIndex from './Pages/PagesIndex'
import PageDetails from './Pages/PageDetails'
import SourcesIndex from './Sources/SourcesIndex'
import SourceDetails from './Sources/SourceDetails'
import AuthorDetails from './Sources/AuthorDetails'
import TopicsIndex from './Topics/TopicsIndex'
import TopicDetails from './Topics/TopicDetails'
import ConfigIndex from './Config/ConfigIndex'

const RouterGroup = ({ children }) => <>{children}</>

// component
const Private = () => {
  const { getCurrentAccount } = useSessionContext()

  const [currentTab, setCurrentTab] = useState(Tabs.PAGES)

  const onNavBarChange = item => {
    if (item.name !== currentTab) {
      setCurrentTab(item.name)

      if (window) {
        window.scrollTo(0, 0)
      }
    }
  }

  // render methods
  const render = () => (
    <View
      position="absolute"
      top="0"
      bottom="0"
      width="100%"
      backgroundColor="background.1"
    >
      <Router>
        <Redirect noThrow from="/signup" to="/" />
        <RouterGroup path="/:accountId">
          <RouterGroup path="pages">
            <PagesIndex path="/" />
            <PageDetails path="/:pageId" />
          </RouterGroup>

          <RouterGroup path="sources">
            <SourcesIndex path="/" />
            <RouterGroup path="/authors">
              <SourcesIndex path="/" />
              <AuthorDetails path="/:query" />
            </RouterGroup>
            <SourceDetails path="/:sourceId" />
          </RouterGroup>

          <RouterGroup path="topics">
            <TopicsIndex path="/" />
            <TopicDetails path="/:topicId" />
          </RouterGroup>

          <RouterGroup path="config">
            <ConfigIndex path="/" />
          </RouterGroup>

          <Redirect noThrow from="*" to="/pages" />
        </RouterGroup>

        <Redirect noThrow from="*" to={`${getCurrentAccount()}/pages`} />
      </Router>

      <NavBar onChange={onNavBarChange} />
    </View>
  )

  return render()
}

export default Private
