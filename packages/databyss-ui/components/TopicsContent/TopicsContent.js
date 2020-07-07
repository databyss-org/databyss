import React from 'react'
import { Router } from '@reach/router'
import { AllTopicsLoader } from '@databyss-org/ui/components/Loaders'
import { sortEntriesAtoZ } from '@databyss-org/services/sources/util'
import IndexPageEntries from '../PageContent/IndexPageEntries'
import IndexPageContent from '../PageContent/IndexPageContent'

export const TopicsRouter = () => (
  <Router>
    <TopicsContent path="/" />
  </Router>
)

const TopicsContent = () => (
  <AllTopicsLoader>
    {topics => {
      const topicsData = Object.values(topics).map(value => ({
        text: value.text.textValue,
        id: value._id,
      }))
      const sortedTopics = sortEntriesAtoZ(topicsData)
      return (
        <IndexPageContent title="All Topics">
          <IndexPageEntries entries={sortedTopics} />
        </IndexPageContent>
      )
    }}
  </AllTopicsLoader>
)

export default TopicsContent
