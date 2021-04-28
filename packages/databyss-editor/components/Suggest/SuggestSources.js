import React, { useState, useEffect, useRef } from 'react'
import { useEditor } from '@databyss-org/slate-react'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import { uid } from '@databyss-org/data/lib/uid'
import {
  CROSSREF,
  GOOGLE_BOOKS,
  OPEN_LIBRARY,
} from '@databyss-org/services/catalog/constants'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { prefixSearchAll } from '@databyss-org/services/blocks'
import { Separator, Text, View } from '@databyss-org/ui/primitives'
import { setSource } from '@databyss-org/services/sources'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { useBlocksInPages } from '@databyss-org/data/pouchdb/hooks'
import { BlockType } from '@databyss-org/services/interfaces'
import { LoadingFallback } from '@databyss-org/ui/components'
import { useEditorPageContext } from '@databyss-org/services/editorPage/EditorPageProvider'

import { useEditorContext } from '../../state/EditorProvider'

import { CatalogResults } from './'
import { slateSelectionToStateSelection } from '../../lib/slateUtils'
import { onBakeInlineAtomic } from '../../lib/inlineUtils'

export const LOCAL_SOURCES = 'LOCAL_SOURCES'

export const formatSource = (value) => {
  console.log('VALUE', value)
  const _value = JSON.parse(JSON.stringify(value))
  // format year
  const year = value?.detail?.year?.textValue
  if (year) {
    _value.detail.year.textValue = year.toString()
  }
  // ensure short name exists, if not create one
  // format year
  if (!value.name) {
    console.log('NAME should be', value.text)
  }

  return _value
}

const SuggestSources = ({
  query,
  dismiss,
  focusEditor,
  active,
  onSuggestionsChanged,
  resultsMode,
  setResultsMode,
  inlineAtomic,
  activeIndexRef,
  ...others
}) => {
  const editor = useEditor()

  const sourcesRes = useBlocksInPages(BlockType.Source)
  const { replace, state, setContent } = useEditorContext()

  const pendingSetContent = useRef(false)

  const sharedWithGroups = useEditorPageContext((c) => c && c.sharedWithGroups)
  const [suggestions, setSuggestsions] = useState()
  const [filteredSuggestions, setFilteredSuggestions] = useState([])

  const { isOnline } = useNotifyContext() || { isOnline: false }

  const filterSuggestions = (_sources) => {
    if (!_sources.length) {
      return []
    }
    return _sources.filter(prefixSearchAll(query)).slice(0, 4)
  }

  const updateSuggestions = () => {
    if (!suggestions?.length) {
      return
    }
    const _nextSuggestions = filterSuggestions(suggestions)
    // onSuggestionsChanged(_nextSuggestions)

    setFilteredSuggestions(_nextSuggestions)
  }

  useEffect(updateSuggestions, [query, suggestions])

  useEffect(() => {
    // reset menu when active state changes
    setResultsMode(LOCAL_SOURCES)
  }, [active])

  const onSourceSelected = (source) => {
    if (!inlineAtomic) {
      if (!source._id) {
        source._id = uid()
        setSource({ ...formatSource(source), sharedWithGroups })
      }

      replace([source])
    } else {
      if (!source._id.length) {
        source._id = uid()
      }
      const _formatteSource = { ...formatSource(source), sharedWithGroups }

      setSource(_formatteSource)

      pendingSetContent.current = true

      onBakeInlineAtomic({
        editor,
        state,
        suggestion: _formatteSource,
        setContent,
      })
    }
    dismiss()
  }

  const _composeLocalSources = (_sourcesDict) => {
    console.log(_sourcesDict)
    let _sources = Object.values(_sourcesDict)
    if (!_sources.length) {
      return []
    }
    _sources = _sources
      .filter(prefixSearchAll(query))
      .slice(0, 4)
      .map((s) => (
        <DropdownListItem
          data-test-element="suggested-menu-sources"
          label={s.name.textValue}
          key={s._id}
          onPress={() => onSourceSelected({ ...s, type: 'SOURCE' })}
        />
      ))
    if (!_sources.length) {
      return []
    }
    return _sources.concat(
      <Separator color="border.3" spacing="extraSmall" key="sep" />
    )
  }

  const _menuItems = [
    {
      action: OPEN_LIBRARY,
      label: 'Search Open Library',
    },
    {
      action: CROSSREF,
      label: 'Search Crossref',
    },
    {
      action: GOOGLE_BOOKS,
      label: 'Search Google Books',
    },
  ]

  const _mode = resultsMode || LOCAL_SOURCES

  // TODO: this function is generic for topic and suggestion
  const setCurrentSourceWithoutSuggestion = () => {
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
    bake source if arrow up or down without suggestion
    */
    if (
      !filteredSuggestions.length &&
      !isOnline &&
      (e.key === 'ArrowDown' || e.key === 'ArrowUp')
    ) {
      setCurrentSourceWithoutSuggestion()
    }

    if (e.key === 'Enter') {
      // no suggestion selected on menu
      if (activeIndexRef.current === -1) {
        setCurrentSourceWithoutSuggestion()
        return
      }
      window.requestAnimationFrame(() => {
        if (!pendingSetContent.current && !active) {
          setCurrentSourceWithoutSuggestion()
        }
      })
    }
  })

  if (!sourcesRes.isSuccess) {
    return <LoadingFallback queryObserver={sourcesRes} />
  }

  if (!suggestions) {
    onSuggestionsChanged(Object.values(sourcesRes.data))
    setSuggestsions(Object.values(sourcesRes.data))
  }

  if (_mode === LOCAL_SOURCES) {
    return _composeLocalSources(Object.values(sourcesRes.data)).concat(
      isOnline ? (
        _menuItems.map((menuItem) => (
          <DropdownListItem
            {...menuItem}
            key={menuItem.action}
            data-test-element="suggest-dropdown"
            onPress={() => {
              setResultsMode(menuItem.action)
              focusEditor()
            }}
          />
        ))
      ) : (
        <View padding="tiny" pl="small">
          <Text variant="uiTextSmall" color="text.3">
            Go online to search source catalogs
          </Text>
        </View>
      )
    )
  }

  return (
    <CatalogResults
      type={_mode}
      query={query}
      selectSource={onSourceSelected}
      dismiss={dismiss}
      {...others}
    />
  )
}

export default SuggestSources
