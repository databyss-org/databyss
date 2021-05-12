import React, { useState, useEffect, useRef } from 'react'
import { Editor, Transforms } from '@databyss-org/slate'
import { useEditor, ReactEditor } from '@databyss-org/slate-react'
import { Text, Button, Icon, View } from '@databyss-org/ui/primitives'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { prefixSearchAll } from '@databyss-org/services/blocks'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import { useBlocksInPages } from '@databyss-org/data/pouchdb/hooks'
import { BlockType } from '@databyss-org/services/interfaces'
import { LoadingFallback } from '@databyss-org/ui/components'
import { useEditorContext } from '../../state/EditorProvider'
import {
  onBakeInlineAtomic,
  setAtomicWithoutSuggestion,
} from '../../lib/inlineUtils'

const SuggestEmbeds = ({
  query,
  dismiss,
  onSuggestionsChanged,
  inlineAtomic,
}) => {
  const editor = useEditor() as ReactEditor & Editor

  console.log(query)
  // const topicsRes = useBlocksInPages(BlockType.Topic)

  // const { replace, state, setContent } = useEditorContext()

  // const pendingSetContent = useRef(false)

  // const [suggestions, setSuggestions] = useState<null | any[]>(null)
  // const [filteredSuggestions, setFilteredSuggestions] = useState([])

  // const onTopicSelected = (topic) => {
  //   if (!inlineAtomic) {
  //     replace([topic])
  //   } else {
  //     // if topic is provided, set the flag so the event listener will ignore command
  //     pendingSetContent.current = true

  //     onBakeInlineAtomic({
  //       editor,
  //       state,
  //       suggestion: topic,
  //       setContent,
  //     })
  //   }
  //   dismiss()
  // }

  // const filterSuggestions = (_topics) => {
  //   if (!_topics.length) {
  //     return []
  //   }
  //   return _topics.filter(prefixSearchAll(query)).slice(0, 4)
  // }

  // const updateSuggestions = () => {
  //   if (!suggestions?.length) {
  //     return
  //   }
  //   const _nextSuggestions = filterSuggestions(suggestions)
  //   onSuggestionsChanged(_nextSuggestions)
  //   setFilteredSuggestions(_nextSuggestions)
  // }

  // useEffect(updateSuggestions, [query, suggestions])

  // const setCurrentTopicWithoutSuggestion = () =>
  //   setAtomicWithoutSuggestion({
  //     editor,
  //     state,
  //     setContent,
  //   })

  // useEventListener('keydown', (e) => {
  //   /*
  //   bake topic if arrow up or down without suggestion
  //   */
  //   if (
  //     !filteredSuggestions.length &&
  //     (e.key === 'ArrowDown' || e.key === 'ArrowUp')
  //   ) {
  //     setCurrentTopicWithoutSuggestion()
  //   }

  //   if (e.key === 'Enter') {
  //     window.requestAnimationFrame(() => {
  //       if (!pendingSetContent.current) {
  //         setCurrentTopicWithoutSuggestion()
  //       }
  //     })
  //   }
  // })

  // if (!topicsRes.isSuccess) {
  //   return <LoadingFallback queryObserver={topicsRes} />
  // }

  // if (!suggestions) {
  //   setSuggestions(Object.values(topicsRes.data))
  // }

  return (
    <Text variant="uiTextSmall" color="gray.3" display="inline">
      paste a link or embed code...
    </Text>
  )
}

// SuggestTopics.defaultProps = {
//   onSuggestions: () => null,
//   onSuggestionsChanged: () => null,
// }

export default SuggestEmbeds
