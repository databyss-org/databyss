import React from 'react'
import { Helmet } from 'react-helmet'
import { Router } from '@reach/router'
import { AllTopicsLoader } from '@databyss-org/ui/components/Loaders'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import TopicDetails from '@databyss-org/ui/components/TopicsContent/TopicDetails'
import {
  sortEntriesAtoZ,
  createIndexPageEntries,
} from '@databyss-org/services/entries/util'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import IndexPageEntries from '../PageContent/IndexPageEntries'
import IndexPageContent from '../PageContent/IndexPageContent'

const TopicsContent = () => {
  const navigate = useNavigationContext((c) => c.navigate)
  return (
    <AllTopicsLoader filtered>
      {(topics) => {
        const topicsData = Object.values(topics).map((value) =>
          createIndexPageEntries({
            text: value.text?.textValue,
            id: value._id,
          })
        )
        const sortedTopics = sortEntriesAtoZ(topicsData, 'text')

        const onTopicClick = (topic) => {
          navigate(`/topics/${topic.id}`)
        }
        return (
          <IndexPageContent title="All Topics">
            <Helmet>
              <meta charSet="utf-8" />
              <title>All Topics</title>
            </Helmet>
            <IndexPageEntries
              onClick={onTopicClick}
              entries={sortedTopics}
              icon={<TopicSvg />}
            />
          </IndexPageContent>
        )
      }}
    </AllTopicsLoader>
  )
}

export const TopicsRouter = () => (
  <Router>
    <TopicsContent path="/" />
    <TopicDetails path=":id" />
  </Router>
)

export default TopicsContent
