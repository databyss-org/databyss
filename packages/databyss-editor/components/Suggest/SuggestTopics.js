import React, { useState, useEffect } from 'react'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { AllTopicsLoader } from '@databyss-org/ui/components/Loaders'
import { prefixSearchAll } from '@databyss-org/services/block/filter'
import { useTopicContext } from '@databyss-org/services/topics/TopicProvider'
import { useEditorContext } from '../../state/EditorProvider'

const SuggestTopics = ({ query, dismiss, onSuggestionsChanged }) => {
  const { replace, state } = useEditorContext()
  const addPageToCacheHeader = useTopicContext(c => c && c.addPageToCacheHeader)

  const [suggestions, setSuggestions] = useState([])
  const [filteredSuggestions, setFilteredSuggestions] = useState([])

  const onTopicSelected = topic => {
    // check document to see if page should be added to topic cache
    if (state.blocks.filter(b => b._id === topic._id).length < 1) {
      addPageToCacheHeader(topic._id, state.pageHeader._id)
    }

    replace([topic])
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
    const _topics = Object.values(topicsDict)
    setSuggestions(_topics)
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
