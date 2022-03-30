import React, { useState, useEffect } from 'react'
import {
  Routes,
  Route,
  NotFoundRedirect,
  useNavigate,
} from '@databyss-org/ui/components/Navigation'
import { QueryClientProvider, QueryClient } from 'react-query'
import { View } from '@databyss-org/ui/primitives'
import { EditorPageProvider } from '@databyss-org/services'
import { UserPreferencesProvider } from '@databyss-org/ui/hooks'
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable window focus refetching globally for all react-query hooks
      // see: https://react-query.tanstack.com/guides/window-focus-refetching
      refetchOnWindowFocus: false,
      // Never set queries as stale
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  },
})

const Redirect = ({ to }) => {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(to)
  })
  return null
}

const PagesRouter = () => (
  <Routes>
    <Route path="/" element={<PagesIndex />} />
    <Route
      path="/:pageId/*"
      element={
        <EditorPageProvider>
          <PageDetails default />
        </EditorPageProvider>
      }
    />
  </Routes>
)

const SourcesRouter = () => (
  <Routes>
    <Route path="/" element={<SourcesIndex />} />
    <Route path="/authors/*">
      <Route path="*" element={<SourcesIndex />} />
      <Route path=":query" element={<AuthorDetails />} />
    </Route>
    <Route path="/:blockId/*" element={<SourceDetails />} />
  </Routes>
)

const TopicsRouter = () => (
  <Routes>
    <Route path="/" element={<TopicsIndex />} />
    <Route path="/:blockId/*" element={<TopicDetails />} />
  </Routes>
)

// component
const Private = () => {
  const [currentTab, setCurrentTab] = useState(Tabs.PAGES)

  const onNavBarChange = (item) => {
    if (item.name !== currentTab) {
      setCurrentTab(item.name)

      if (window) {
        window.scrollTo(0, 0)
      }
    }
  }

  // render methods
  const render = () => (
    <QueryClientProvider client={queryClient}>
      <UserPreferencesProvider>
        <View
          position="absolute"
          top="0"
          bottom="0"
          width="100%"
          backgroundColor="background.1"
        >
          <Routes>
            <Route path="*" element={<NotFoundRedirect />} />
            <Route path="/signup" element={<Redirect to="/" />} />
            <Route path="/:accountId/*">
              <Route path="*" element={<NotFoundRedirect />} />
              <Route path="pages/*" element={<PagesRouter />} />
              <Route path="sources/*" element={<SourcesRouter />} />
              <Route path="topics/*" element={<TopicsRouter />} />
              <Route path="config/*" element={<ConfigIndex />} />
            </Route>
          </Routes>

          <NavBar onChange={onNavBarChange} />
        </View>
      </UserPreferencesProvider>
    </QueryClientProvider>
  )

  return render()
}

export default Private
