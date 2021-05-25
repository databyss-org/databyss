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
import { pxUnits } from '@databyss-org/ui/theming/theme'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { useEditorContext } from '../../state/EditorProvider'

import { setEmbedMedia } from '../../lib/inlineUtils'
import { Block } from '../../../databyss-services/interfaces/Block'
import { IframeAttributes, getIframeAttrs } from './iframeUtils'

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
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [iframeAtts, setIframeAtts] = useState<IframeAttributes | false>(false)

  useEffect(() => {
    const _iFrame = getIframeAttrs(query)
    setIframeAtts(_iFrame)
  }, [query])

  const filterSuggestions = (_topics) => {
    if (!_topics.length) {
      return []
    }
    return query?.length
      ? _topics
          .map(weightedSearch(query))
          .filter(prefixSearchAll(query))
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

  const setEmbed = (embed: Embed | void) => {
    if (embed) {
      setEmbedMedia({
        editor,
        state,
        setContent,
        hasSuggestion: embed,
      })
    }

    if (iframeAtts) {
      setEmbedMedia({
        editor,
        state,
        setContent,
        attributes: iframeAtts,
      })
    }
  }

  useEventListener('keydown', (e: KeyboardEvent) => {
    /*
    bake topic if arrow up or down without suggestion
    */
    // if (
    //   !filteredSuggestions.length &&
    //   (e.key === 'ArrowDown' || e.key === 'ArrowUp')
    // ) {
    //   setCurrentTopicWithoutSuggestion()
    // }

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

  const Suggestion = () => {
    // if not iframe suggestion, check if suggestion with same title exists
    if (!iframeAtts) {
      return (
        <View
          overflowX="hidden"
          overflowY="auto"
          maxHeight={pxUnits(menuHeight)}
        >
          {filteredSuggestions.map((s: Embed) => (
            // eslint-disable-next-line react/jsx-indent
            <DropdownListItem
              label={s.text.textValue}
              key={s._id}
              onPress={() => onEmbedSelected({ ...s, type: BlockType.Embed })}
            />
          ))}
        </View>
      )
    }

    return (
      <View p="small">
        <iframe
          id={query}
          title={query}
          // border="0px"
          frameBorder="0px"
          {...iframeAtts}
        />
      </View>
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
