import React, { useState, useEffect, useRef } from 'react'
import { useEditor } from '@databyss-org/slate-react'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { prefixSearchAll } from '@databyss-org/services/blocks'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import { useBlocksInPages } from '@databyss-org/data/pouchdb/hooks'
import { BlockType } from '@databyss-org/services/interfaces'
import { LoadingFallback } from '@databyss-org/ui/components'
import { useEditorContext } from '../../state/EditorProvider'
import { slateSelectionToStateSelection } from '../../lib/slateUtils'
import { onBakeInlineAtomic } from '../../lib/inlineUtils'

const SuggestTopics = ({
  query,
  dismiss,
  onSuggestionsChanged,
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
      console.log(topic)
      // INLINE REFACTOR
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
    return _topics.filter(prefixSearchAll(query)).slice(0, 4)
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

  const setCurrentTopicWithoutSuggestion = () => {
    const _index = state.selection.anchor.index
    const _stateBlock = state.blocks[_index]
    // set the block with a re-render
    const selection = slateSelectionToStateSelection(editor)

    // preserve selection id from DB
    if (state.selection._id) {
      selection._id = state.selection._id
    }

    setContent({
      selection,
      operations: [
        {
          index: _index,
          text: _stateBlock.text,
          convertInlineToAtomic: true,
        },
      ],
    })
  }

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
  }

  return filteredSuggestions.map((s) => (
    // eslint-disable-next-line react/jsx-indent
    <DropdownListItem
      label={s.text.textValue}
      key={s._id}
      onPress={() => onTopicSelected({ ...s, type: 'TOPIC' })}
    />
  ))
}

SuggestTopics.defaultProps = {
  onSuggestions: () => null,
  onSuggestionsChanged: () => null,
}

export default SuggestTopics
