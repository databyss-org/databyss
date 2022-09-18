import React, {
  PropsWithChildren,
  useCallback,
  useState,
  useEffect,
  ReactNode,
  useImperativeHandle,
  useRef,
  RefObject,
  MutableRefObject,
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
import { setTopic } from '@databyss-org/data/pouchdb/topics'
import { setSource } from '@databyss-org/data/pouchdb/sources'
import { CitationOutputTypes } from '@databyss-org/services/citations/constants'
import {
  ScrollView,
  View,
  Text,
  ScrollViewProps,
  Icon,
  Grid,
  ViewProps,
  Button,
} from '@databyss-org/ui/primitives'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import SourcesSvg from '@databyss-org/ui/assets/sources.svg'
import SearchSvg from '@databyss-org/ui/assets/search.svg'
import EditSvg from '@databyss-org/ui/assets/edit.svg'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import { urlSafeName } from '@databyss-org/services/lib/util'
import { updateAccessedAt } from '@databyss-org/data/pouchdb/utils'
import { IndexResults } from './IndexResults'
import { getAccountFromLocation } from '../../../databyss-services/session/utils'
import { useUserPreferencesContext } from '../../hooks'
import IndexPageMenu from '../../components/IndexPage/IndexPageMenu'
import { useScrollMemory } from '../../hooks/scrollMemory/useScrollMemory'

export interface IndexPageViewProps extends ScrollViewProps {
  path: string[]
  block?: Block
  menuChild?: ReactNode
  handlesRef?: RefObject<IndexPageTitleInputHandles>
  scrollViewRef?: MutableRefObject<HTMLElement | null>
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
  const isReadOnly = useSessionContext((c) => c && c.isReadOnly)
  const [title, setTitle] = useState(getTitleFromBlock(block, path))
  const { navigate } = useNavigationContext()
  const blocksRes = useBlocks(BlockType._ANY)
  const pagesRes = usePages()
  const isSearch = path[0] === 'Search'

  useImperativeHandle(handlesRef, () => ({
    updateTitle: (block: Block) => setTitle(getTitleFromBlock(block, path)),
  }))

  useEffect(() => {
    if (isSearch) {
      setTitle(getTitleFromBlock(block, path))
    }
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
          setSource(block! as Source, {
            pages: pagesRes.data,
            blocks: blocksRes.data,
          })
          break
      }
    }, 3000),
    [block]
  )

  useEffect(() => () => setBlockText.flush(), [])

  const onChange = (value: string) => {
    // console.log('[IndexPageContent] onChange', value)
    setTitle(value)
    setBlockText(value)
  }

  const onKeyDown = (evt: KeyboardEvent) => {
    if (evt.key === 'Enter') {
      evt.preventDefault()
      if (isSearch) {
        navigate(`/${getAccountFromLocation(true)}/search/${title}`)
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
      placeholder={isSearch ? 'Search' : `untitled ${indexName}`}
      value={title}
      readonly={isReadOnly || (!block && !isSearch)}
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
        pb="tiny"
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
  scrollViewRef,
  ...others
}: PropsWithChildren<IndexPageViewProps>) => {
  const {
    showModal,
    getTokensFromPath,
    navigate,
    location,
  } = useNavigationContext()
  const titleInputHandlesRef = useRef<IndexPageTitleInputHandles>(null)
  const isReadOnly = useSessionContext((c) => c && c.isReadOnly)
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)

  // useEffect(() => {
  //   restoreScroll()
  // }, [])

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
  // if no nice URL, make one and redirect
  const blockName =
    block?.type === BlockType.Source
      ? (block as Source).name?.textValue ?? block.text.textValue
      : block?.text.textValue
  useEffect(() => {
    if (block) {
      if (block && !isPublicAccount()) {
        updateAccessedAt(block!._id)
      }
      const path = getTokensFromPath()
      const niceName = urlSafeName(blockName!)
      if (!path.nice?.length) {
        window.requestAnimationFrame(() => {
          navigate(`${location.pathname}/${niceName}${location.hash}`, {
            replace: true,
          })
        })
      } else if (path.nice.join('/') !== niceName) {
        window.requestAnimationFrame(() => {
          const _to = `/${path.type}/${path.params}/${niceName}${location.hash}`
          navigate(_to, { replace: true })
        })
      }
    }
  }, [blockName])
  return (
    <>
      <StickyHeader path={path} contextMenu={<IndexPageMenu block={block} />} />
      <ScrollView
        pr="em"
        pl="large"
        flex="1"
        pb="extraLarge"
        ref={scrollViewRef}
        {...others}
      >
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
            (isReadOnly ? (
              <SourceTitleAndCitationView block={block} mb="small" />
            ) : (
              <View position="relative" mt="em" mb="small">
                <SourceTitleAndCitationView
                  block={block}
                  opacity={0}
                  zIndex={-1}
                />
                <Button
                  onPress={onPressDetails}
                  variant="uiTextButtonShaded"
                  alignSelf="flex-start"
                  childViewProps={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  mt="small"
                >
                  <Icon
                    data-test-button="open-source-modal"
                    color="gray.3"
                    sizeVariant="tiny"
                    pr="tiny"
                  >
                    <EditSvg />
                  </Icon>
                  <Text variant="uiTextSmall" color="gray.3">
                    View/Edit Citation
                  </Text>
                </Button>
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
  const scrollViewRef = useRef<HTMLElement | null>(null)
  const restoreScroll = useScrollMemory(scrollViewRef)

  if (
    !blocksRes.isSuccess ||
    !pagesRes.isSuccess ||
    !blocksRes.data?.[blockId!]
  ) {
    return <LoadingFallback queryObserver={[blocksRes, pagesRes]} />
  }

  return (
    <IndexPageView
      path={getPathFromBlock(blocksRes.data![blockId!])}
      block={blocksRes.data![blockId!]}
      key={blockId}
      scrollViewRef={scrollViewRef}
    >
      <IndexResults
        relatedBlockId={blockId!}
        key={`${blockType}_${blockId}`}
        blocks={blocksRes.data!}
        pages={pagesRes.data!}
        onLast={restoreScroll}
      />
    </IndexPageView>
  )
}
