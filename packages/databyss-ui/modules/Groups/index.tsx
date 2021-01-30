import React from 'react'
import { Router } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { GroupDetail } from './GroupDetail'

export const GroupsRouter = () => (
  <Router>
    <GroupDetail path=":id" />
  </Router>
)
