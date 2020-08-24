import React, { useState, useEffect } from 'react'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { AllTopicsLoader } from '@databyss-org/ui/components/Loaders'
import { prefixSearchAll } from '@databyss-org/services/block/filter'
import { useEditorContext } from '../../state/EditorProvider'

const SuggestTopics = ({
  query,
  dismiss,
  onSuggestions,
  onSuggestionsChanged,
}) => {
  const { replace } = useEditorContext()
  const [suggestions, setSuggestions] = useState([])
  const [filteredSuggestions, setFilteredSuggestions] = useState([])

  const onTopicSelected = topic => {
    replace([topic])
    dismiss()
  }

  const filterSuggestions = _topics => {
    if (!_topics.length) {
      return []
    }
    return _topics.filter(prefixSearchAll(query)).slice(0, 4)
  }

  const onTopicsLoaded = topicsDict => {
    const _topics = Object.values(topicsDict)
    onSuggestions(_topics)
    setSuggestions(_topics)
    setFilteredSuggestions(filterSuggestions(_topics))
  }

  useEffect(
    () => {
      if (!suggestions?.length) {
        return
      }
      const _nextSuggestions = filterSuggestions(suggestions)
      onSuggestionsChanged(_nextSuggestions)
      setFilteredSuggestions(_nextSuggestions)
    },
    [query]
  )

  return (
    <AllTopicsLoader onLoad={onTopicsLoaded}>
      {filteredSuggestions.map(s => (
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
