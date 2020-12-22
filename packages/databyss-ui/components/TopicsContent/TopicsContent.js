import React from 'react'
import { Router } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import TopicDetails from '@databyss-org/ui/components/TopicsContent/TopicDetails'

export const TopicsRouter = () => (
  <Router>
    <TopicDetails path=":id" />
  </Router>
)
