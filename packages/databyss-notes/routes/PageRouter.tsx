import React from 'react'
import { Router } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { PageContent } from '@databyss-org/ui'
import { EditorPageProvider } from '@databyss-org/services'

export const PageRouter = () => (
  <EditorPageProvider>
    <Router>
      <PageContent path=":id" />
    </Router>
  </EditorPageProvider>
)
