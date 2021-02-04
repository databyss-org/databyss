import React, { PropsWithChildren } from 'react'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { Helmet } from 'react-helmet'
import { useBlocks } from '@databyss-org/data/pouchdb/hooks'
import { BlockType } from '@databyss-org/editor/interfaces'
import { LoadingFallback } from '@databyss-org/ui/components'
import {
  ScrollView,
  View,
  Text,
  ScrollViewProps,
} from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/theme'
import { IndexResults } from './IndexResults'

export interface IndexPageViewProps extends ScrollViewProps {
  title: string
}

export const IndexPageView = ({
  title,
  children,
  ...others
}: PropsWithChildren<IndexPageViewProps>) => (
  <ScrollView p="medium" flex="1" {...others}>
    <Helmet>
      <meta charSet="utf-8" />
      <title>{title}</title>
    </Helmet>
    <View py="medium" px={pxUnits(28)}>
      <Text variant="bodyHeading1" color="text.3">
        {title}
      </Text>
    </View>
    {children}
  </ScrollView>
)

interface IndexPageContentProps {
  blockType: BlockType
}

export const IndexPageContent = ({ blockType }: IndexPageContentProps) => {
  const { blockId } = useParams()
  const blocksRes = useBlocks(blockType)

  if (!blocksRes.isSuccess) {
    return <LoadingFallback queryObserver={blocksRes} />
  }

  return (
    <IndexPageView title={blocksRes.data![blockId].text.textValue}>
      <IndexResults
        blockType={blockType}
        relatedBlockId={blockId}
        key={`${blockType}_${blockId}`}
      />
    </IndexPageView>
  )
}
