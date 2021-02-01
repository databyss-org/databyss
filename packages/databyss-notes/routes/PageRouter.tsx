import React from 'react'
import { Router } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { PageContent } from '@databyss-org/ui'

export const PageRouter = () => (
  <Router>
    <PageContent path=":id" />
  </Router>
)
