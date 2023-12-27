import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Editor } from '@databyss-org/slate'
import { BlockType } from '@databyss-org/services/interfaces'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'
import { useEditor, ReactEditor } from '@databyss-org/slate-react'
import { useBlocksInPages } from '@databyss-org/data/pouchdb/hooks/useBlocksInPages'
import {
  weightedSearch,
  prefixSearchAll,
} from '@databyss-org/services/blocks/filter'
import { Text, View } from '@databyss-org/ui/primitives'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import { debounce } from 'lodash'
import { useOpenGraph } from '@databyss-org/data/pouchdb/hooks/useOpenGraph'
import { pxUnits } from '@databyss-org/ui/theming/theme'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { useEditorContext } from '../../state/EditorProvider'
import { setEmbedMedia } from '../../lib/inlineUtils'
import {
  Block,
  Embed,
  EmbedDetail,
  MediaTypes,
} from '../../../databyss-services/interfaces/Block'
import { removeCurrentInlineInput } from '../../lib/inlineUtils/onEscapeInInlineAtomicField'
import { IframeComponent } from './IframeComponent'
import { isHttpInsecure } from '../EmbedMedia'

const TIMEOUT_LENGTH = 9000

const SuggestEmbeds = ({
  query,
  onSuggestionsChanged,
  menuHeight,
  dismiss,
}) => {
  const editor = useEditor() as ReactEditor & Editor
  const embedRes = useBlocksInPages(BlockType.Embed)
  const { state, setContent } = useEditorContext()

  const pendingSetContent = useRef(false)

  const [suggestions, setSuggestions] = useState<null | Block[]>(null)
  const filteredSuggestionLengthRef = useRef(0)
  const [filteredSuggestions, setFilteredSuggestions] = useState<Embed[]>([])
  const [embedDetail, setEmbedDetail] = useState<EmbedDetail | false>(false)
  const [debounceQuery, setDebounceQuery] = useState('')
  const [mediaUnavailable, setMediaUnavailable] = useState(false)

  useEffect(() => {
    filteredSuggestionLengthRef.current = filteredSuggestions.length
  }, [filteredSuggestions.length])

  const _timeoutRef = useRef<null | any>(null)

  // debounce the query search
  const queryChange = useCallback(
    debounce((q: string) => {
      setDebounceQuery(q)
    }, 1500),
    []
  )

  useEffect(() => {
    queryChange(query)
  }, [query])

  const toggleTimeout = () => {
    if (_timeoutRef.current) {
      clearTimeout(_timeoutRef.current)
    }

    _timeoutRef.current = setTimeout(() => {
      if (
        !filteredSuggestionLengthRef.current &&
        embedDetail &&
        embedDetail?.mediaType === MediaTypes.UNFETCHED
      ) {
        setMediaUnavailable(true)
      }
    }, TIMEOUT_LENGTH)
    // restart 15 seconds
  }

  // default attributes if not set already, this will be used in offline mode
  useEffect(() => {
    setMediaUnavailable(false)
    if (
      embedDetail &&
      embedDetail?.mediaType !== MediaTypes.UNFETCHED &&
      _timeoutRef.current
    ) {
      clearTimeout(_timeoutRef.current)
      return
    }

    if (
      !embedDetail ||
      (embedDetail.mediaType === MediaTypes.UNFETCHED &&
        embedDetail?.src !== query)
    ) {
      setEmbedDetail({ mediaType: MediaTypes.UNFETCHED, src: query })
      toggleTimeout()
    }
  }, [query, embedDetail])

  const graphRes = useOpenGraph(debounceQuery)
  // get title data from OG and set as attribute
  useEffect(() => {
    const _data: EmbedDetail | undefined = graphRes?.data

    if (_data?.mediaType) {
      setEmbedDetail({ ...embedDetail, ..._data })
    }
  }, [graphRes.data, query])

  const filterSuggestions = (_topics) => {
    if (!_topics.length) {
      return []
    }
    return query?.length
      ? _topics
          .map(weightedSearch(query))
          .filter(prefixSearchAll(query))
          .sort((a, b) => (a.weight < b.weight ? 1 : -1))
          .slice(0, 20)
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
  const setEmbed = (embed: Embed | void) => {
    if (embed) {
      pendingSetContent.current = true
      setEmbedMedia({
        editor,
        state,
        setContent,
        hasSuggestion: embed,
      })
      return
    }

    if (embedDetail) {
      setEmbedMedia({
        editor,
        state,
        setContent,
        attributes: embedDetail,
      })
      return
    }
    // if enter was pressed without a selected embed, check if it exists as text in our embedded cache
    if (
      filteredSuggestions.length &&
      filteredSuggestions[0].text.textValue === query
    ) {
      // assume its the first in the filtered suggestions
      setEmbedMedia({
        editor,
        state,
        setContent,
        hasSuggestion: filteredSuggestions[0],
      })
      return
    }

    // if no suggestion or valid code, convert to plaintext
    removeCurrentInlineInput({ state, setContent })
  }

  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      window.requestAnimationFrame(() => {
        if (!pendingSetContent.current) {
          setEmbed()
        }
      })
    }
  })

  if (!embedRes.isSuccess) {
    return <LoadingFallback queryObserver={embedRes} />
  }

  if (!suggestions && embedRes.data) {
    setSuggestions(Object.values(embedRes.data))
  }

  const onEmbedSelected = (embed) => {
    setEmbed(embed)

    dismiss()
  }

  const MediaUnavailable = () => (
    <Text variant="uiTextSmall" color="gray.3" display="inline" p="small">
      Cannot Load Media
    </Text>
  )

  const Suggestion = () => {
    if (mediaUnavailable) {
      return <MediaUnavailable />
    }
    // if not iframe suggestion, check if suggestion with same title exists
    if (!embedDetail || filteredSuggestions.length) {
      // check if filtered suggestions exist
      return (
        <View
          overflowX="hidden"
          overflowY="auto"
          maxHeight={pxUnits(menuHeight)}
        >
          {filteredSuggestions.length ? (
            filteredSuggestions.map((s: Embed) => (
              // eslint-disable-next-line react/jsx-indent
              <DropdownListItem
                label={s.text.textValue}
                key={s._id}
                onPress={() => onEmbedSelected({ ...s, type: BlockType.Embed })}
              />
            ))
          ) : (
            <MediaUnavailable />
          )}
        </View>
      )
    }

    if (isHttpInsecure(embedDetail.src)) {
      embedDetail.src = `${
        process.env.API_URL
      }/media/proxy?url=${encodeURIComponent(embedDetail.src)}`
    }
    return embedDetail && embedDetail?.mediaType === MediaTypes.UNFETCHED ? (
      <View p="large">
        <LoadingFallback />
      </View>
    ) : (
      <IframeComponent embedDetail={embedDetail} highlight={false} />
    )
  }

  return (
    <View>
      {filteredSuggestions && query?.length ? (
        Suggestion()
      ) : (
        <>
          <Text variant="uiTextSmall" color="gray.3" display="inline" p="small">
            {query?.length
              ? 'press enter to embed...'
              : 'paste a link or embed code...'}
          </Text>

          {query?.length ? Suggestion() : null}
        </>
      )}
    </View>
  )
}

export default SuggestEmbeds
