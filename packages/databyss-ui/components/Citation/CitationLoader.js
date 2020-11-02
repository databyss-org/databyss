import React from 'react'

import { useCitationContext } from '@databyss-org/services/citations/CitationProvider'

import { pxUnits } from '../../primitives'

import MakeLoader from '../Loaders/MakeLoader'

import Citation from './Citation'

const CitationLoader = props => {
  const { sourceDetail, formatOptions } = props

  let generateCitation = null

  const citationContext = useCitationContext()
  if (citationContext) {
    generateCitation = citationContext.generateCitation
  }

  const render = () => {
    if (!generateCitation) {
      return null
    }

    return (
      <MakeLoader resources={generateCitation(sourceDetail, formatOptions)}>
        {citation => (
          <Citation
            citation={citation}
            formatOptions={formatOptions}
            childViewProps={{
              marginTop: pxUnits(20),
              marginBottom: pxUnits(20),
            }}
          />
        )}
      </MakeLoader>
    )
  }

  return render()
}

export default CitationLoader
