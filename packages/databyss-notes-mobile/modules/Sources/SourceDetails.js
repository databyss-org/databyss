import React from 'react'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { ScrollView } from '@databyss-org/ui/primitives'
import IndexSourceContent from '@databyss-org/ui/components/SourcesContent/IndexSourceContent'
import { BlockType } from '@databyss-org/services/interfaces'
import { useBlockRelations, useBlocks } from '@databyss-org/data/pouchdb/hooks'
import { LoadingFallback } from '@databyss-org/ui/components'
import { getScrollViewMaxHeight } from '../../utils/getScrollViewMaxHeight'
import { MobileView } from '../Mobile'
import SourcesMetadata from './SourcesMetadata'

const buildHeaderItems = (title, id) => [
  SourcesMetadata,
  {
    title,
    url: `${SourcesMetadata.url}/${id}`,
  },
]

// component
const SourceDetails = () => {
  const { sourceId } = useParams()
  const blockRelationRes = useBlockRelations(BlockType.Source)
  const sourcesRes = useBlocks(BlockType.Source)
  const queryRes = [blockRelationRes, sourcesRes]

  let pageTitle = 'Loading...'

  if (queryRes.some((q) => !q.isSuccess)) {
    return <LoadingFallback queryObserver={queryRes} />
  }

  const relations = Object.values(blockRelationRes.data).filter(
    (_rel) => _rel.relatedBlock === sourceId
  )

  pageTitle = sourcesRes.data[sourceId].text.textValue

  // render methods
  const renderSourceDetails = () => (
    <ScrollView maxHeight={getScrollViewMaxHeight()} pr="medium" py="large">
      <IndexSourceContent relations={relations} />
    </ScrollView>
  )

  const render = () => (
    <MobileView headerItems={buildHeaderItems(pageTitle, sourceId)}>
      {renderSourceDetails()}
    </MobileView>
  )

  return render()
}

export default SourceDetails
