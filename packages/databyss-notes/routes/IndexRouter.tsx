import React from 'react'
import { Router } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { BlockType } from '@databyss-org/services/interfaces'
import { IndexPageContent } from '@databyss-org/ui/modules'

interface IndexRouterProps {
  blockType: BlockType
}

export const IndexRouter = ({ blockType }: IndexRouterProps) => (
  <Router>
    <IndexPageContent blockType={blockType} path=":blockId" />
  </Router>
)
