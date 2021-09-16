import React, {
  PropsWithChildren,
  useCallback,
  useState,
  useEffect,
  ReactNode,
  useImperativeHandle,
  useRef,
  RefObject,
} from 'react'
import { debounce } from 'lodash'
import {
  useNavigationContext,
  useParams,
} from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { Helmet } from 'react-helmet'
import { useBlocks, usePages } from '@databyss-org/data/pouchdb/hooks'
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
  Grid,
  ViewProps,
} from '@databyss-org/ui/primitives'
import { isMobile, isMobileOrMobileOs } from '@databyss-org/ui/lib/mediaQuery'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import SourcesSvg from '@databyss-org/ui/assets/sources.svg'
import SearchSvg from '@databyss-org/ui/assets/search.svg'
import EditSvg from '@databyss-org/ui/assets/edit.svg'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import { IndexResults } from './IndexResults'
import { getAccountFromLocation } from '../../../databyss-services/session/utils'
import { useUserPreferencesContext } from '../../hooks'
import { pxUnits } from '../../theming/views'

export interface IndexPageViewProps extends ScrollViewProps {
  path: string[]
  block?: Block
  menuChild?: ReactNode
  handlesRef?: RefObject<IndexPageTitleInputHandles>
}

export interface IndexPageTitleInputHandles {
  updateTitle: (block: Block) => void
}

const getTitleFromBlock = (block: Block | undefined, path: string[]) =>
  block
    ? {
        [BlockType.Source]: block.text.textValue,
        [BlockType.Topic]: block.text.textValue,
      }[block.type]
    : path[path.length - 1]

export const IndexPageTitleInput = ({
  path,
  block,
  handlesRef,
  ...others
}: IndexPageViewProps) => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const [title, setTitle] = useState(getTitleFromBlock(block, path))
  const { navigate } = useNavigationContext()
  const blocksRes = useBlocks(BlockType._ANY)
  const pagesRes = usePages()

  useImperativeHandle(handlesRef, () => ({
    updateTitle: (block: Block) => setTitle(getTitleFromBlock(block, path)),
  }))

  useEffect(() => {
    setTitle(getTitleFromBlock(block, path))
  }, [path])

  const setBlockText = useCallback(
    debounce((value: string) => {
      if (!block) {
        return
      }
      switch (block!.type) {
        case BlockType.Topic:
          block!.text.textValue = value
          setTopic(block!, { pages: pagesRes.data, blocks: blocksRes.data })
          break
        case BlockType.Source:
          block!.text.textValue = value
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

  const onKeyDown = (evt: KeyboardEvent) => {
    if (evt.key === 'Enter') {
      evt.preventDefault()
      if (path[0] === 'Search') {
        navigate(`/${getAccountFromLocation()}/search/${title}`)
      }
    }
  }

  const indexName = block
    ? {
        [BlockType.Source]: 'source',
        [BlockType.Topic]: 'topic',
      }[block.type]
    : path[path.length - 1]

  const icon = block
    ? {
        [BlockType.Source]: <SourceSvg />,
        [BlockType.Topic]: <TopicSvg />,
      }[block.type]
    : {
        Bibliography: <SourcesSvg />,
        Search: <SearchSvg />,
        Authors: <AuthorSvg />,
      }[path[0]]

  return (
    <TitleInput
      autoFocus
      placeholder={`untitled ${indexName}`}
      value={title}
      readonly={
        isPublicAccount() ||
        isMobileOrMobileOs() ||
        (!block && path[0] !== 'Search')
      }
      onChange={onChange}
      onKeyDown={onKeyDown}
      icon={icon && <Icon>{icon}</Icon>}
      data-test-path="text"
      {...others}
    />
  )
}

interface SourceTitleAndCitationViewProps extends ViewProps {
  block: Block
}

const SourceTitleAndCitationView = ({
  block,
  ...others
}: SourceTitleAndCitationViewProps) => {
  const { getPreferredCitationStyle } = useUserPreferencesContext()
  return (
    <View>
      <SourceCitationView
        py="none"
        pb="small"
        sourceId={block?._id}
        formatOptions={{
          outputType: CitationOutputTypes.BIBLIOGRAPHY,
          styleId: getPreferredCitationStyle(),
        }}
        noCitationFallback={
          <Text variant="bodyNormalUnderline" color="text.3">
            {block.text.textValue}
          </Text>
        }
        {...others}
      />
    </View>
  )
}

export const IndexPageView = ({
  path,
  block,
  children,
  menuChild,
  ...others
}: PropsWithChildren<IndexPageViewProps>) => {
  const { showModal } = useNavigationContext()
  const titleInputHandlesRef = useRef<IndexPageTitleInputHandles>(null)
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const onUpdateBlock = (block: Block) => {
    titleInputHandlesRef.current?.updateTitle(block)
  }
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
      <ScrollView pr="em" pl="large" flex="1" pb="extraLarge" {...others}>
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
          {menuChild ? (
            <Grid singleRow>
              <View flexGrow={1}>
                <IndexPageTitleInput
                  path={path}
                  block={block}
                  handlesRef={titleInputHandlesRef}
                />
              </View>
              <View>{menuChild}</View>
            </Grid>
          ) : (
            <IndexPageTitleInput
              path={path}
              block={block}
              handlesRef={titleInputHandlesRef}
            />
          )}
          {block?.type === BlockType.Source &&
            (isPublicAccount() || isMobile() ? (
              <SourceTitleAndCitationView block={block} />
            ) : (
              <View position="relative" mt="small">
                <BaseControl
                  onPress={onPressDetails}
                  position="relative"
                  userSelect="text"
                  css={{
                    pointerEvents: 'none',
                  }}
                >
                  <Icon
                    data-test-button="open-source-modal"
                    position="absolute"
                    left="mediumNegative"
                    color="gray.4"
                    top={pxUnits(4)}
                    sizeVariant="tiny"
                    css={{
                      pointerEvents: 'all',
                    }}
                  >
                    <EditSvg />
                  </Icon>
                  <SourceTitleAndCitationView
                    block={block}
                    opacity={0}
                    zIndex={-1}
                  />
                </BaseControl>
                <SourceTitleAndCitationView
                  block={block}
                  position="absolute"
                  zIndex={1}
                  left={0}
                  top={0}
                />
              </View>
            ))}
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
  const blocksRes = useBlocks(BlockType._ANY)
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
