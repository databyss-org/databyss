import React, { useState, useEffect, useRef } from 'react'
import { useEditor } from '@databyss-org/slate-react'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { prefixSearchAll, weightedSearch } from '@databyss-org/services/blocks'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import { useBlocksInPages } from '@databyss-org/data/pouchdb/hooks'
import { BlockType } from '@databyss-org/services/interfaces'
import { LoadingFallback } from '@databyss-org/ui/components'
import { View } from '@databyss-org/ui/primitives'
import { pxUnits } from '@databyss-org/ui/theming/views'

import { useEditorContext } from '../../state/EditorProvider'
import {
  onBakeInlineAtomic,
  setAtomicWithoutSuggestion,
} from '../../lib/inlineUtils'

const SuggestTopics = ({
  query,
  dismiss,
  onSuggestionsChanged,
  menuHeight,
  inlineAtomic,
}) => {
  const editor = useEditor()
  const topicsRes = useBlocksInPages(BlockType.Topic)

  const { replace, state, setContent } = useEditorContext()

  const pendingSetContent = useRef(false)

  const [suggestions, setSuggestions] = useState(null)
  const [filteredSuggestions, setFilteredSuggestions] = useState([])

  const onTopicSelected = (topic) => {
    if (!inlineAtomic) {
      replace([topic])
    } else {
      // if topic is provided, set the flag so the event listener will ignore command
      pendingSetContent.current = true

      onBakeInlineAtomic({
        editor,
        state,
        suggestion: topic,
        setContent,
      })
    }
    dismiss()
  }

  const filterSuggestions = (_topics) => {
    if (!_topics.length) {
      return []
    }
    return _topics
      .map(weightedSearch(query))
      .filter(prefixSearchAll(query))
      .sort((a, b) => (a.weight < b.weight ? 1 : -1))
      .slice(0, 20)
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

  const setCurrentTopicWithoutSuggestion = () =>
    setAtomicWithoutSuggestion({
      editor,
      state,
      setContent,
    })

  useEventListener('keydown', (e) => {
    /*
    bake topic if arrow up or down without suggestion
    */
    if (
      !filteredSuggestions.length &&
      (e.key === 'ArrowDown' || e.key === 'ArrowUp')
    ) {
      setCurrentTopicWithoutSuggestion()
    }

    if (e.key === 'Enter') {
      window.requestAnimationFrame(() => {
        if (!pendingSetContent.current) {
          setCurrentTopicWithoutSuggestion()
        }
      })
    }
  })

  if (!topicsRes.isSuccess) {
    return <LoadingFallback queryObserver={topicsRes} />
  }
  if (!suggestions) {
    setSuggestions(Object.values(topicsRes.data))
    return <LoadingFallback />
  }

  return (
    <View overflowX="hidden" overflowY="auto" maxHeight={pxUnits(menuHeight)}>
      {filteredSuggestions.map((s) => (
        // eslint-disable-next-line react/jsx-indent
        <DropdownListItem
          label={s.text.textValue}
          key={s._id}
          onPress={() => onTopicSelected({ ...s, type: 'TOPIC' })}
        />
      ))}
    </View>
  )
}

SuggestTopics.defaultProps = {
  onSuggestions: () => null,
  onSuggestionsChanged: () => null,
}

export default SuggestTopics
