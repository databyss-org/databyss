import React, { useState, useEffect, useRef } from 'react'
import { Editor } from '@databyss-org/slate'
import { BlockType, Embed } from '@databyss-org/services/interfaces'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'
import { useEditor, ReactEditor } from '@databyss-org/slate-react'
import { useBlocksInPages } from '@databyss-org/data/pouchdb/hooks/useBlocksInPages'
import {
  weightedSearch,
  prefixSearchAll,
} from '@databyss-org/services/blocks/filter'
import { Text, View } from '@databyss-org/ui/primitives'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import { useOpenGraph } from '@databyss-org/data/pouchdb/hooks/useOpenGraph'
import { pxUnits } from '@databyss-org/ui/theming/theme'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { useEditorContext } from '../../state/EditorProvider'
import { setEmbedMedia } from '../../lib/inlineUtils'
import { Block, MediaTypes } from '../../../databyss-services/interfaces/Block'
import { IframeAttributes } from './iframeUtils'
import { removeCurrentInlineInput } from '../../lib/inlineUtils/onEscapeInInlineAtomicField'
import { IframeComponent } from './IframeComponent'
import { isHttpInsecure } from '../EmbedMedia'
import { usePages } from '../../../databyss-data/pouchdb/hooks/usePages'
import { Page } from '../../../databyss-services/interfaces/Page'

const TIMEOUT_LENGTH = 7000

// load pages
// filter suggestions of page titles
// select page or enter it manually
// save  page and block relations of that page

const SuggestLinks = ({ query, onSuggestionsChanged, menuHeight, dismiss }) => {
  const editor = useEditor() as ReactEditor & Editor
  // const embedRes = useBlocksInPages(BlockType.Embed)
  const pagesRes = usePages()
  const { state, setContent } = useEditorContext()

  const pendingSetContent = useRef(false)

  const [suggestions, setSuggestions] = useState<null | Page[]>(null)
  const filteredSuggestionLengthRef = useRef(0)
  const [filteredSuggestions, setFilteredSuggestions] = useState<Page[]>([])
  const [iframeAtts, setIframeAtts] = useState<IframeAttributes | false>(false)
  const [mediaUnavailable, setMediaUnavailable] = useState(false)

  useEffect(() => {
    filteredSuggestionLengthRef.current = filteredSuggestions.length
  }, [filteredSuggestions.length])

  const _timeoutRef = useRef<null | any>(null)

  const toggleTimeout = () => {
    if (_timeoutRef.current) {
      clearTimeout(_timeoutRef.current)
    }

    _timeoutRef.current = setTimeout(() => {
      if (
        !filteredSuggestionLengthRef.current &&
        iframeAtts &&
        iframeAtts?.mediaType === MediaTypes.UNFETCHED
      ) {
        setMediaUnavailable(true)
      }
    }, TIMEOUT_LENGTH)
    // restart 15 seconds
  }

  // default attributes if not set already, this will be used in offline mode
  //   useEffect(() => {
  //     setMediaUnavailable(false)
  //     if (
  //       iframeAtts &&
  //       iframeAtts?.mediaType !== MediaTypes.UNFETCHED &&
  //       _timeoutRef.current
  //     ) {
  //       clearTimeout(_timeoutRef.current)
  //       return
  //     }

  //     if (
  //       !iframeAtts ||
  //       (iframeAtts.mediaType === MediaTypes.UNFETCHED &&
  //         iframeAtts?.src !== query)
  //     ) {
  //       console.log('IN HERE', iframeAtts)
  //       setIframeAtts({ mediaType: MediaTypes.UNFETCHED, src: query })
  //       toggleTimeout()
  //     }
  //   }, [query, iframeAtts])

  //   const graphRes = useOpenGraph(query)
  // get title data from OG and set as attribute
  // useEffect(() => {
  //   const _data = graphRes?.data

  //   if (_data?.mediaType) {
  //     setIframeAtts({ ...iframeAtts, ..._data })
  //   }
  // }, [graphRes.data, query])

  const filterSuggestions = (pages) => {
    if (!pages.length) {
      return []
    }
    return query?.length
      ? pages
          .map(weightedSearch(query, 'name'))
          .filter(prefixSearchAll(query, 'name'))
          .sort((a, b) => (a.weight < b.weight ? 1 : -1))
      : []
  }

  const updateSuggestions = () => {
    if (!suggestions?.length) {
      return
    }
    const _nextSuggestions = filterSuggestions(suggestions)
    onSuggestionsChanged(_nextSuggestions)
    setFilteredSuggestions(_nextSuggestions)
  }

  useEffect(updateSuggestions, [query, suggestions])

  // save data
  const setPage = (page: Page | void) => {
    console.log('set page', page)
    // if (page) {
    //   pendingSetContent.current = true
    //   setEmbedMedia({
    //     editor,
    //     state,
    //     setContent,
    //     hasSuggestion: embed,
    //   })
    //   return
    // }

    // if (iframeAtts) {
    //   setEmbedMedia({
    //     editor,
    //     state,
    //     setContent,
    //     attributes: iframeAtts,
    //   })
    //   return
    // }
    // // if enter was pressed without a selected embed, check if it exists as text in our embedded cache
    // if (
    //   filteredSuggestions.length &&
    //   filteredSuggestions[0].text.textValue === query
    // ) {
    //   // assume its the first in the filtered suggestions
    //   setEmbedMedia({
    //     editor,
    //     state,
    //     setContent,
    //     hasSuggestion: filteredSuggestions[0],
    //   })
    //   return
    // }

    // // if no suggestion or valid code, convert to plaintext
    // removeCurrentInlineInput({ state, setContent })
  }

  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      window.requestAnimationFrame(() => {
        if (!pendingSetContent.current) {
          setPage()
        }
      })
    }
  })

  if (!pagesRes.isSuccess) {
    return <LoadingFallback queryObserver={pagesRes} />
  }

  if (!suggestions && pagesRes.data) {
    setSuggestions(Object.values(pagesRes.data))
  }

  const onPageSelected = (page: Page) => {
    setPage(page)

    dismiss()
  }

  const Suggestion = () => (
    <View overflowX="hidden" overflowY="auto" maxHeight={pxUnits(menuHeight)}>
      {filteredSuggestions.length ? (
        filteredSuggestions.map((s: Page) => (
          // eslint-disable-next-line react/jsx-indent
          <DropdownListItem
            label={s.name}
            key={s._id}
            onPress={() => onPageSelected(s)}
          />
        ))
      ) : (
        <Text variant="uiTextSmall" color="gray.3" display="inline">
          no pages found
        </Text>
      )}
    </View>
  )

  return (
    <View>
      {filteredSuggestions.length && query?.length ? (
        Suggestion()
      ) : (
        <>
          <Text variant="uiTextSmall" color="gray.3" display="inline" p="small">
            {!query?.length ? 'enter a page name' : Suggestion()}
          </Text>
        </>
      )}
    </View>
  )
}

export default SuggestLinks
