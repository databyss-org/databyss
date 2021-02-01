import React from 'react'
import { Router } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { GroupDetail } from '@databyss-org/ui'

export const GroupRouter = () => (
  <Router>
    <GroupDetail path=":id" />
  </Router>
)
