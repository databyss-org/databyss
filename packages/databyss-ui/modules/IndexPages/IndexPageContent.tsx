import React, { PropsWithChildren, useCallback, useState } from 'react'
import { debounce } from 'lodash'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { Helmet } from 'react-helmet'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import { Block, BlockType, Source } from '@databyss-org/services/interfaces'
import {
  LoadingFallback,
  SourceCitationView,
  StickyHeader,
  TitleInput,
} from '@databyss-org/ui/components'
import { useDocuments } from '@databyss-org/data/pouchdb/hooks/useDocuments'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import {
  ScrollView,
  View,
  Text,
  ScrollViewProps,
} from '@databyss-org/ui/primitives'
import { IndexResults } from './IndexResults'
import { isMobileOrMobileOs } from '../../lib/mediaQuery'
import { setTopic } from '../../../databyss-data/pouchdb/topics'
import { setSource } from '../../../databyss-data/pouchdb/sources'
import { CitationOutputTypes } from '../../../databyss-services/citations/constants'

export interface IndexPageViewProps extends ScrollViewProps {
  path: string[]
  block?: Block
}

export const IndexPageTitleInput = ({ path, block }: IndexPageViewProps) => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const [title, setTitle] = useState(
    block ? block.text.textValue : path[path.length - 1]
  )

  const setBlockText = useCallback(
    debounce((value: string) => {
      block!.text.textValue = value
      switch (block!.type) {
        case BlockType.Topic:
          setTopic(block!)
          break
        case BlockType.Source:
          setSource(block! as Source)
          break
      }
    }, 250),
    [block]
  )

  const onChange = (value: string) => {
    setTitle(value)
    setBlockText(value)
  }

  if (!block) {
    return (
      <Text
        data-test-element="index-results"
        variant="bodyHeading1"
        color="text.3"
      >
        {path[path.length - 1]}
      </Text>
    )
  }

  const indexName = {
    [BlockType.Source]: 'source',
    [BlockType.Topic]: 'topic',
  }[block.type]
  return (
    <TitleInput
      autoFocus
      placeholder={`untitled ${indexName}`}
      value={title}
      readonly={isPublicAccount() || isMobileOrMobileOs()}
      onChange={onChange}
    />
  )
}

export const IndexPageView = ({
  path,
  block,
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
        <IndexPageTitleInput path={path} block={block} />
        {block && (
          <SourceCitationView
            sourceId={block?._id}
            formatOptions={{
              outputType: CitationOutputTypes.BIBLIOGRAPHY,
              styleId: 'mla',
            }}
          />
        )}
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
    <IndexPageView
      path={getPathFromBlock(blocksRes.data![blockId])}
      block={blocksRes.data![blockId]}
    >
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
