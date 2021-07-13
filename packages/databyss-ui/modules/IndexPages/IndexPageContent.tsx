import React, {
  PropsWithChildren,
  useCallback,
  useState,
  useEffect,
} from 'react'
import { debounce } from 'lodash'
import {
  useNavigationContext,
  useParams,
} from '@databyss-org/ui/components/Navigation/NavigationProvider'
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
import { setTopic } from '@databyss-org/data/pouchdb/topics'
import { setSource } from '@databyss-org/data/pouchdb/sources'
import { CitationOutputTypes } from '@databyss-org/services/citations/constants'
import {
  ScrollView,
  View,
  Text,
  ScrollViewProps,
  BaseControl,
  Icon,
} from '@databyss-org/ui/primitives'
import { isMobileOrMobileOs } from '@databyss-org/ui/lib/mediaQuery'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import EditSvg from '@databyss-org/ui/assets/edit.svg'
import { IndexResults } from './IndexResults'
import { pxUnits } from '../../theming/views'

export interface IndexPageViewProps extends ScrollViewProps {
  path: string[]
  block?: Block
}

export const IndexPageTitleInput = ({
  path,
  block,
  ...others
}: IndexPageViewProps) => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const [title, setTitle] = useState(
    block
      ? {
          [BlockType.Source]: (block as Source).name?.textValue,
          [BlockType.Topic]: block.text.textValue,
        }[block.type]
      : path[path.length - 1]
  )

  const setBlockText = useCallback(
    debounce((value: string) => {
      switch (block!.type) {
        case BlockType.Topic:
          block!.text.textValue = value
          setTopic(block!)
          break
        case BlockType.Source:
          ;(block as Source).name!.textValue = value
          setSource(block! as Source)
          break
      }
    }, 250),
    [block]
  )

  useEffect(() => () => setBlockText.flush(), [])

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

  const icon =
    block &&
    {
      [BlockType.Source]: (
        <Icon>
          <SourceSvg />
        </Icon>
      ),
      [BlockType.Topic]: (
        <Icon>
          <TopicSvg />
        </Icon>
      ),
    }[block.type]

  return (
    <TitleInput
      autoFocus
      placeholder={`untitled ${indexName}`}
      value={title}
      readonly={isPublicAccount() || isMobileOrMobileOs()}
      onChange={onChange}
      icon={icon}
      {...others}
    />
  )
}

export const IndexPageView = ({
  path,
  block,
  children,
  ...others
}: PropsWithChildren<IndexPageViewProps>) => {
  const { showModal } = useNavigationContext()
  const onUpdateBlock = (nextBlock: Block) => {}
  const onPressDetails = () => {
    showModal({
      component: block?.type,
      visible: true,
      props: {
        refId: block?._id,
        onUpdate: onUpdateBlock,
      },
    })
  }
  return (
    <>
      <StickyHeader path={path} />
      <ScrollView pr="em" pl="large" flex="1" {...others}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>{path[path.length - 1]}</title>
        </Helmet>
        <View
          pt={{ _: 'medium', mobile: 'small' }}
          pb="medium"
          pl={{ _: 'small', mobile: 'medium' }}
          widthVariant="content"
        >
          <IndexPageTitleInput path={path} block={block} />
          {block?.type === BlockType.Source && (
            <BaseControl onPress={onPressDetails} position="relative">
              <Icon
                position="absolute"
                left="mediumNegative"
                top={pxUnits(5)}
                color="gray.5"
                sizeVariant="tiny"
              >
                <EditSvg />
              </Icon>
              <View>
                <Text variant="bodyNormalUnderline" color="text.3">
                  {block.text.textValue}
                </Text>
                <SourceCitationView
                  sourceId={block?._id}
                  formatOptions={{
                    outputType: CitationOutputTypes.BIBLIOGRAPHY,
                    styleId: 'mla',
                  }}
                />
              </View>
            </BaseControl>
          )}
        </View>
        <View px={{ _: 'small', mobile: 'medium' }} flexGrow={1}>
          {children}
        </View>
      </ScrollView>
    </>
  )
}

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
      key={blockId}
    >
      <IndexResults
        relatedBlockId={blockId}
        key={`${blockType}_${blockId}`}
        blocks={blocksRes.data!}
        pages={pagesRes.data!}
      />
    </IndexPageView>
  )
}
