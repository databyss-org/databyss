import React from 'react'
import { Router } from '@reach/router'
import { AllTopicsLoader } from '@databyss-org/ui/components/Loaders'
import TopicDetails from '@databyss-org/ui/components/TopicsContent/TopicDetails'
import {
  sortEntriesAtoZ,
  createIndexPageEntries,
} from '@databyss-org/services/entries/util'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import IndexPageEntries from '../PageContent/IndexPageEntries'
import IndexPageContent from '../PageContent/IndexPageContent'

export const TopicsRouter = () => (
  <Router>
    <TopicsContent path="/" />
    <TopicDetails path=":id" />
  </Router>
)

const TopicsContent = () => (
  <AllTopicsLoader>
    {topics => {
      const topicsData = Object.values(topics).map(value =>
        createIndexPageEntries({
          text: value.text?.textValue,
          id: value._id,
        })
      )
      const sortedTopics = sortEntriesAtoZ(topicsData, 'text')

      return (
        <IndexPageContent title="All Topics">
          <IndexPageEntries entries={sortedTopics} icon={<TopicSvg />} />
        </IndexPageContent>
      )
    }}
  </AllTopicsLoader>
)

export default TopicsContent
