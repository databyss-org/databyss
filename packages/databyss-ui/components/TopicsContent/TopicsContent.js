import React from 'react'
import { Router } from '@reach/router'
import TopicDetails from '@databyss-org/ui/components/TopicsContent/TopicDetails'

export const TopicsRouter = () => (
  <Router>
    <TopicDetails path=":id" />
  </Router>
)
