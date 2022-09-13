import React from 'react'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { ScrollView } from '@databyss-org/ui/primitives'
// import IndexSourceContent from '@databyss-org/ui/components/SourcesContent/IndexSourceContent'
import { BlockType, Source } from '@databyss-org/services/interfaces'
import { IndexPageContent } from '@databyss-org/ui/modules'
import { useBlockRelations } from '@databyss-org/data/pouchdb/hooks'
import { LoadingFallback } from '@databyss-org/ui/components'
import { useDocument } from '@databyss-org/data/pouchdb/hooks/useDocument'
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
  const { blockId } = useParams()

  const blockRelationRes = useBlockRelations(BlockType.Source)
  const sourceRes = useDocument(blockId)
  const queryRes = [blockRelationRes, sourceRes]

  let pageTitle = 'Loading...'

  if (queryRes.some((q) => !q.isSuccess)) {
    return <LoadingFallback queryObserver={queryRes} />
  }

  pageTitle = sourceRes.data[blockId].text.textValue

  // // render methods
  const renderSourceDetails = () => (
    <ScrollView maxHeight={getScrollViewMaxHeight()} flexGrow={1}>
      <IndexPageContent blockType="SOURCE" />
    </ScrollView>
  )

  const render = () => (
    <MobileView headerItems={buildHeaderItems(pageTitle, blockId)}>
      {renderSourceDetails()}
    </MobileView>
  )

  return render()
  // return <div> source detail</div>
}

export default SourceDetails
