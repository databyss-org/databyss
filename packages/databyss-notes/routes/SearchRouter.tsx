import React from 'react'
import { Router } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { SearchContent } from '@databyss-org/ui/modules'

export const SearchRouter = () => (
  <Router>
    <SearchContent path=":query" />
  </Router>
)
