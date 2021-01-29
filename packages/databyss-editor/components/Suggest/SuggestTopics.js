import React, { useState, useEffect, useRef } from 'react'
import { Editor, Transforms } from '@databyss-org/slate'
import { useEditor } from '@databyss-org/slate-react'
import cloneDeep from 'clone-deep'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { AllTopicsLoader } from '@databyss-org/ui/components/Loaders'
import { prefixSearchAll } from '@databyss-org/services/blocks'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import { useTopicContext } from '@databyss-org/services/topics/TopicProvider'
import { useEditorContext } from '../../state/EditorProvider'
import { splitTextAtOffset, mergeText } from '../../lib/clipboardUtils'
import { getTextOffsetWithRange } from '../../state/util'
import { slateSelectionToStateSelection } from '../../lib/slateUtils'

const SuggestTopics = ({
  query,
  dismiss,
  onSuggestionsChanged,
  inlineAtomic,
}) => {
  const editor = useEditor()

  const { replace, state, setContent } = useEditorContext()
  const addPageToCacheHeader = useTopicContext(
    (c) => c && c.addPageToCacheHeader
  )

  const pendingSetContent = useRef(false)

  const [suggestions, setSuggestions] = useState(null)
  const [filteredSuggestions, setFilteredSuggestions] = useState([])

  const onTopicSelected = (topic) => {
    // check document to see if page should be added to topic cache
    if (state.blocks.filter((b) => b._id === topic._id).length < 1) {
      if (state.pageHeader?._id) {
        addPageToCacheHeader(topic._id, state.pageHeader._id)
      }
    }
    if (!inlineAtomic) {
      replace([topic])
    } else {
      // if topic is provided, set the flag so the event listener will ignore command
      pendingSetContent.current = true

      // compose new block with inline atomic id
      const _index = state.selection.anchor.index
      const _stateBlock = state.blocks[_index]

      // replace inner text with updated topic
      const _markupTextValue = getTextOffsetWithRange({
        text: _stateBlock.text,
        rangeType: 'inlineAtomicMenu',
      })

      // get value before offset
      let _textBefore = splitTextAtOffset({
        text: _stateBlock.text,
        offset: _markupTextValue.offset,
      }).before

      // get value after markup range
      const _textAfter = splitTextAtOffset({
        text: _stateBlock.text,
        offset: _markupTextValue.offset + _markupTextValue.length,
      }).after

      // merge first block with topic value, add mark and id to second block
      _textBefore = mergeText(_textBefore, {
        textValue: `#${topic.text.textValue}`,
        ranges: [
          {
            offset: 0,
            length: topic.text.textValue.length + 1,
            marks: [['inlineTopic', topic._id]],
          },
        ],
      })

      // get the offset value where the cursor should be placed after operation
      const _caretOffest = _textBefore.textValue.length

      // merge second block with first block
      const _newText = mergeText(_textBefore, _textAfter)

      // create a new block with updated ranges
      const _newBlock = {
        ..._stateBlock,
        text: _newText,
      }

      // toggle editor to remove active 'inlineAtomicMenu'
      Editor.removeMark(editor, 'inlineAtomicMenu')

      // update the selection
      const _sel = cloneDeep(state.selection)
      _sel.anchor.offset = _caretOffest
      _sel.focus.offset = _caretOffest

      setContent({
        selection: _sel,
        operations: [
          {
            index: _index,
            text: _newBlock.text,
            withRerender: true,
          },
        ],
      })
      // Slate editor needs to retrigger current position
      Transforms.move(editor, {
        unit: 'character',
        distance: 1,
        reverse: true,
      })
      Transforms.move(editor, {
        unit: 'character',
        distance: 1,
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

  const onTopicsLoaded = (topicsDict) => {
    if (!suggestions) {
      const _topics = Object.values(topicsDict)
      setSuggestions(_topics)
    }
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

  return (
    <AllTopicsLoader onLoad={onTopicsLoaded}>
      {filteredSuggestions.map((s) => (
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
