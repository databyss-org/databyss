import React, { useState, useEffect } from 'react'
import { Editor } from '@databyss-org/slate'
import { useEditor } from '@databyss-org/slate-react'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { AllTopicsLoader } from '@databyss-org/ui/components/Loaders'
import { prefixSearchAll } from '@databyss-org/services/block/filter'
import { useTopicContext } from '@databyss-org/services/topics/TopicProvider'
import { useEditorContext } from '../../state/EditorProvider'
import { toggleMark } from '../../lib/slateUtils'

const SuggestTopics = ({
  query,
  dismiss,
  onSuggestionsChanged,
  inlineAtomic,
}) => {
  const editor = useEditor()

  const { replace, state, setContent } = useEditorContext()
  const addPageToCacheHeader = useTopicContext(c => c && c.addPageToCacheHeader)

  const [suggestions, setSuggestions] = useState(null)
  const [filteredSuggestions, setFilteredSuggestions] = useState([])

  const onTopicSelected = topic => {
    // check document to see if page should be added to topic cache
    if (state.blocks.filter(b => b._id === topic._id).length < 1) {
      addPageToCacheHeader(topic._id, state.pageHeader._id)
    }
    if (!inlineAtomic) {
      replace([topic])
    } else {
      // compose new block with inline atomic id
      const _index = state.selection.anchor.index
      const _stateBlock = state.blocks[_index]

      // replace inlineAtomicMenu range with a tuple including the topic id
      const _ranges = _stateBlock.text.ranges.map(r => {
        if (r.marks[0] === 'inlineAtomicMenu') {
          return { ...r, marks: [['inlineTopic', topic._id]] }
        }
        return r
      })
      const _newBlock = {
        ..._stateBlock,
        text: { ..._stateBlock.text, ranges: _ranges },
      }
      // toggle editor to remove active 'inlineAtomicMenu'
      Editor.removeMark(editor, 'inlineAtomicMenu')

      // TODO: replace inner text with new text from the topic provider
      setContent({
        selection: state.selection,
        operations: [
          {
            index: _index,
            text: _newBlock.text,
            withRerender: true,
          },
        ],
      })
    }

    dismiss()
  }

  const filterSuggestions = _topics => {
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

  const onTopicsLoaded = topicsDict => {
    if (!suggestions) {
      const _topics = Object.values(topicsDict)
      setSuggestions(_topics)
    }
  }

  useEffect(updateSuggestions, [query, suggestions])

  return (
    <AllTopicsLoader onLoad={onTopicsLoaded}>
      {filteredSuggestions.map(s => (
        // eslint-disable-next-line react/jsx-indent
        <DropdownListItem
          label={s.text.textValue}
          key={s._id}
          onPress={() => onTopicSelected({ ...s, type: 'TOPIC' })}
        />
      ))}
    </AllTopicsLoader>
  )
}

SuggestTopics.defaultProps = {
  onSuggestions: () => null,
  onSuggestionsChanged: () => null,
}

export default SuggestTopics
