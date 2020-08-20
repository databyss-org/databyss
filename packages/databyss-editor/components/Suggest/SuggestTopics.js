import React from 'react'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { AllTopicsLoader } from '@databyss-org/ui/components/Loaders'
import { prefixSearch } from '@databyss-org/services/block/filter'
import { useEditorContext } from '../../state/EditorProvider'

const SuggestTopics = ({ query, dismiss }) => {
  const { replace } = useEditorContext()

  const onTopicSelected = topic => {
    replace([topic])
    dismiss()
  }

  const _composeLocalTopics = _topicsDict => {
    let _topics = Object.values(_topicsDict)
    if (!_topics.length) {
      return []
    }
    _topics = _topics
      .filter(prefixSearch(query))
      .slice(0, 4)
      .map(s => (
        <DropdownListItem
          label={s.text.textValue}
          key={s._id}
          onPress={() => onTopicSelected({ ...s, type: 'TOPIC' })}
        />
      ))

    return _topics
  }

  return <AllTopicsLoader>{_composeLocalTopics}</AllTopicsLoader>
}

export default SuggestTopics
