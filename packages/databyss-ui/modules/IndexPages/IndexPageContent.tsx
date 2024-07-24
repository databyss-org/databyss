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
  useMemo,
} from 'react'
import { debounce } from 'lodash'
import {
  useNavigationContext,
  useParams,
} from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { Helmet } from 'react-helmet'
import {
  useBlocks,
  useDocuments,
  usePages,
} from '@databyss-org/data/pouchdb/hooks'
import {
  Block,
  BlockRelation,
  BlockType,
  Embed,
  ResourceNotFoundError,
  Source,
} from '@databyss-org/services/interfaces'
import {
  LoadingFallback,
  // SourceCitationView,
  StickyHeader,
  TitleInput,
} from '@databyss-org/ui/components'
import { setTopic } from '@databyss-org/data/pouchdb/topics'
import { setSource } from '@databyss-org/data/pouchdb/sources'
// import { CitationOutputTypes } from '@databyss-org/services/citations/constants'
import {
  ScrollView,
  View,
  Text,
  ScrollViewProps,
  Icon,
  Grid,
  ViewProps,
} from '@databyss-org/ui/primitives'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import SourcesSvg from '@databyss-org/ui/assets/sources.svg'
import SearchSvg from '@databyss-org/ui/assets/search.svg'
import MediaSvg from '@databyss-org/ui/assets/play.svg'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import { urlSafeName } from '@databyss-org/services/lib/util'
import { updateAccessedAt } from '@databyss-org/data/pouchdb/utils'
import { setEmbed } from '@databyss-org/services/embeds'
import { useDocument } from '@databyss-org/data/pouchdb/hooks/useDocument'
import { ResolveEmbed } from '@databyss-org/editor/components/ResolveEmbed'
import { useQueryClient } from '@tanstack/react-query'
import { blockTypeToSelector } from '@databyss-org/data/pouchdb/selectors'
import { IndexResults } from './IndexResults'
import { getAccountFromLocation } from '../../../databyss-services/session/utils'
// import { useUserPreferencesContext } from '../../hooks'
import IndexPageMenu from '../../components/IndexPage/IndexPageMenu'
import { useScrollMemory } from '../../hooks/scrollMemory/useScrollMemory'
import { darkTheme } from '../../theming/theme'
import ErrorFallback from '../../components/Notify/ErrorFallback'
import { SourceHeader } from './SourceHeader'
import { queryClient } from '@databyss-org/services/lib/queryClient'

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
        [BlockType.Source]: (block as Source).name?.textValue,
        [BlockType.Topic]: block.text.textValue,
        [BlockType.Embed]: block.text.textValue,
      }[block.type]
    : path[path.length - 1]

const setTitleOnBlock = (block: Block, title: string) => ({
  ...block,
  ...(block.type === BlockType.Source
    ? { name: { textValue: title, ranges: [] } }
    : {
        text: {
          ...block.text,
          textValue: title,
        },
      }),
})

export const IndexPageTitleInput = ({
  path,
  block,
  handlesRef,
  ...others
}: IndexPageViewProps) => {
  const isReadOnly = useSessionContext((c) => c && c.isReadOnly)
  const [title, setTitle] = useState(getTitleFromBlock(block, path))
  const queryClient = useQueryClient()
  const { navigate } = useNavigationContext()
  // const blocksRes = useBlocks(BlockType._ANY)
  // const pagesRes = usePages()
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
      const _block = setTitleOnBlock(block, value)
      console.log('[IndexPageTitleInput]', _block)
      queryClient.setQueryData([`useDocument_${_block._id}`], _block)
      switch (block!.type) {
        case BlockType.Topic:
          setTopic(_block)
          break
        case BlockType.Embed:
          setEmbed(_block as Embed)
          break
        case BlockType.Source:
          setSource(_block as Source)
          break
      }
    }, 750),
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
        [BlockType.Embed]: <MediaSvg />,
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
      value={isReadOnly ? getTitleFromBlock(block, path) : title}
      readonly={isReadOnly || (!block && !isSearch)}
      onChange={onChange}
      onKeyDown={onKeyDown}
      icon={icon && <Icon>{icon}</Icon>}
      data-test-path="text"
      {...others}
    />
  )
}

interface EmbedHeaderProps extends ViewProps {
  block: Embed
}

const EmbedHeader = ({ block, ...others }: EmbedHeaderProps) => (
  <ResolveEmbed data={block} position="relative" {...others} />
)

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
  const queryClient = useQueryClient()

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
        updateAccessedAt(
          block!._id,
          queryClient,
          blockTypeToSelector(block.type)
        )
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
  return useMemo(() => {
    console.log('[IndexPageContent] render children')
    return (
      <>
        <StickyHeader
          path={path}
          contextMenu={<IndexPageMenu block={block} />}
        />
        <ScrollView
          pt="medium"
          pr="em"
          pl="medium"
          flex="1"
          pb="extraLarge"
          ref={scrollViewRef}
          bg="background.1"
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
            {block?.type === BlockType.Source && (
              <SourceHeader
                source={block as Source}
                onPressDetails={onPressDetails}
                readOnly={isReadOnly}
              />
            )}
            {block?.type === BlockType.Embed && (
              <>
                <EmbedHeader block={block as Embed} mt="medium" mb="large" />
                <Text variant="bodyHeading2" color="text.3">
                  References
                </Text>
              </>
            )}
          </View>
          <View px={{ _: 'small', mobile: 'medium' }} flexGrow={1}>
            {children}
          </View>
        </ScrollView>
      </>
    )
  }, [path, block])
}

interface IndexPageContentProps {
  blockType: BlockType
}

export const getPathFromBlock = (block: Block) => {
  let _text = block.text.textValue
  if (
    block.type === BlockType.Source &&
    (block as Source).name?.textValue !== null
  ) {
    _text = (block as Source).name?.textValue!
  }
  const path = [_text]
  const indexName = {
    [BlockType.Source]: 'Sources',
    [BlockType.Topic]: 'Topics',
    [BlockType.Embed]: 'Media',
  }[block.type]
  if (indexName) {
    path.push(indexName)
  }
  return path.reverse()
}

export const IndexPageContent = ({ blockType }: IndexPageContentProps) => {
  const { blockId } = useParams()
  // console.log(
  //   `[IndexPageContent] useDocument_r_${blockId}`,
  //   queryClient.getQueryData([`useDocument_r_${blockId}`])
  // )
  // const blocksRes = useBlocks(BlockType._ANY)
  const blockRes = useDocument<Block>(blockId!)
  const pagesRes = usePages()
  const scrollViewRef = useRef<HTMLElement | null>(null)
  const restoreScroll = useScrollMemory(scrollViewRef)
  const blockRelationRes = useDocument<BlockRelation>(`r_${blockId}`)

  const blockIds: string[] = []

  if (blockRelationRes.isSuccess && pagesRes.isSuccess) {
    // gather the pages to fetch
    blockRelationRes.data!.pages.forEach((page) => {
      if (!pagesRes.data[page]) {
        console.warn('[IndexPageContent] page missing', page)
        return
      }
      pagesRes.data[page].blocks.forEach((block) => {
        blockIds.push(block._id)
      })
    })
  }

  // console.log(
  //   `[IndexPageContent] related_${blockId}`,
  //   queryClient.getQueryData([`related_${blockId}`])
  // )

  const blocksRes = useDocuments<Block>(blockIds, {
    enabled: !!blockIds.length,
    queryKey: [`related_${blockId}`],
  })

  // console.log('[IndexPageContent] blocksRes', blockId, blocksRes.dataUpdatedAt)
  // console.log(
  //   '[IndexPageContent] blockRelationRes',
  //   blockId,
  //   blockRelationRes.dataUpdatedAt
  // )

  // const pageBlockCount = Object.values(pagesRes.data ?? {}).reduce(
  //   (sum, page) => sum + page.blocks.length,
  //   0
  // )

  return useMemo(() => {
    console.log('[IndexPageContent] render')
    const queryRes = [blockRelationRes, blocksRes, pagesRes]
    if (queryRes.some((q) => !q.isSuccess)) {
      return <LoadingFallback queryObserver={queryRes} />
    }
    if (!blockRes.data || blockRes.data.type !== blockType) {
      return <LoadingFallback queryObserver={[blockRes, pagesRes]} />
    }
    if (blockRelationRes.isSuccess && !blockRelationRes.data) {
      return (
        <ErrorFallback
          error={new ResourceNotFoundError()}
          message="Resource not found"
        />
      )
    }

    return (
      <IndexPageView
        path={getPathFromBlock(blockRes.data)}
        block={blockRes.data}
        key={blockId}
        scrollViewRef={scrollViewRef}
        theme={darkTheme}
      >
        <IndexResults
          relatedBlockId={blockId!}
          key={`${blockType}_${blockId}_${blocksRes.dataUpdatedAt}`}
          blocks={blocksRes.data!}
          pages={pagesRes.data!}
          onLast={restoreScroll}
          textOnly={blockType === BlockType.Embed}
          // pageBlockCount={pageBlockCount}
          blockRelation={blockRelationRes.data!}
        />
      </IndexPageView>
    )
  }, [blockRelationRes.dataUpdatedAt, blocksRes.dataUpdatedAt])
}
