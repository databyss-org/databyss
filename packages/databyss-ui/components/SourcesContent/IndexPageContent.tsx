import React from 'react'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { Helmet } from 'react-helmet'
import { useBlocks } from '@databyss-org/data/pouchdb/hooks'
import { BlockType } from '@databyss-org/editor/interfaces'
import { LoadingFallback } from '@databyss-org/ui/components'
import { ScrollView, View, Text } from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/theme'
import IndexResults from './IndexResults'

interface IndexPageContentProps {
  blockType: BlockType
}

export const IndexPageContent = ({ blockType }: IndexPageContentProps) => {
  const { query } = useParams()
  const blocksRes = useBlocks(blockType)

  if (!blocksRes.isSuccess) {
    return <LoadingFallback queryObserver={blocksRes} />
  }

  const pageTitle = blocksRes.data![query].text.textValue

  return (
    <ScrollView p="medium" flex="1">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{pageTitle}</title>
      </Helmet>
      <View py="medium" px={pxUnits(28)}>
        <Text variant="bodyHeading1" color="text.3">
          {pageTitle}
        </Text>
      </View>
      <IndexResults blockType={blockType} relatedBlockId={query} />
    </ScrollView>
  )
}
