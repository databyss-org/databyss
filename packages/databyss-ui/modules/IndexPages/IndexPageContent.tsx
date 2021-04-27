import React, { PropsWithChildren } from 'react'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { Helmet } from 'react-helmet'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import { Block, BlockType } from '@databyss-org/services/interfaces'
import { LoadingFallback, StickyHeader } from '@databyss-org/ui/components'
import { useDocuments } from '@databyss-org/data/pouchdb/hooks/useDocuments'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import {
  ScrollView,
  View,
  Text,
  ScrollViewProps,
} from '@databyss-org/ui/primitives'
import { IndexResults } from './IndexResults'

export interface IndexPageViewProps extends ScrollViewProps {
  path: string[]
}

export const IndexPageView = ({
  path,
  children,
  ...others
}: PropsWithChildren<IndexPageViewProps>) => (
  <>
    <StickyHeader path={path} />
    <ScrollView px="em" flex="1" {...others}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{path[path.length - 1]}</title>
      </Helmet>
      <View
        pt={{ _: 'medium', mobile: 'small' }}
        pb="medium"
        pl={{ _: 'small', mobile: 'medium' }}
      >
        <Text
          data-test-element="index-results"
          variant="bodyHeading1"
          color="text.3"
        >
          {path[path.length - 1]}
        </Text>
      </View>
      <View px={{ _: 'small', mobile: 'medium' }} flexGrow={1}>
        {children}
      </View>
    </ScrollView>
  </>
)

interface IndexPageContentProps {
  blockType: BlockType
}

export const getPathFromBlock = (block: Block) => {
  const path = [block.text.textValue]
  const indexName = {
    [BlockType.Source]: 'Sources',
    [BlockType.Topic]: 'Topics',
  }[block.type]
  if (indexName) {
    path.push(indexName)
  }
  return path.reverse()
}

export const IndexPageContent = ({ blockType }: IndexPageContentProps) => {
  const { blockId } = useParams()
  const blocksRes = useDocuments<Block>({
    doctype: DocumentType.Block,
  })
  const pagesRes = usePages()

  if (
    !blocksRes.isSuccess ||
    !pagesRes.isSuccess ||
    !blocksRes.data?.[blockId]
  ) {
    return <LoadingFallback queryObserver={[blocksRes, pagesRes]} />
  }

  return (
    <IndexPageView path={getPathFromBlock(blocksRes.data![blockId])}>
      <IndexResults
        blockType={blockType}
        relatedBlockId={blockId}
        key={`${blockType}_${blockId}`}
        blocks={blocksRes.data!}
        pages={pagesRes.data!}
      />
    </IndexPageView>
  )
}
