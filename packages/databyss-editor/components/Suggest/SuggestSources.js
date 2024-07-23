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
import { prefixSearchAll, weightedSearch } from '@databyss-org/services/blocks'
import { Separator, Text, View } from '@databyss-org/ui/primitives'
import { setSource } from '@databyss-org/services/sources'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { useBlocksInPages } from '@databyss-org/data/pouchdb/hooks'
import { BlockType } from '@databyss-org/services/interfaces'
import { LoadingFallback } from '@databyss-org/ui/components'
import { useEditorPageContext } from '@databyss-org/services/editorPage/EditorPageProvider'
import { formatSource } from '@databyss-org/services/sources/lib'

import { useEditorContext } from '../../state/EditorProvider'

import { CatalogResults } from './'
import {
  onBakeInlineAtomic,
  setAtomicWithoutSuggestion,
} from '../../lib/inlineUtils'

export const LOCAL_SOURCES = 'LOCAL_SOURCES'

// use to truncate no more than a max amount of characters
const truncate = (input, max) =>
  input.length > max ? `${input.substring(0, max)}...` : input

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

  const sourcesRes = useBlocksInPages(BlockType.Source, {
    previousIfNull: true,
  })
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
    if (!source._id) {
      source._id = uid()
      console.log('[SuggestSource] setSource')
      setSource({ ...formatSource(source), sharedWithGroups })
    }

    if (!inlineAtomic) {
      replace([source])
    } else {
      // if (!source._id.length) {
      //   source._id = uid()
      // }
      const _formatteSource = { ...formatSource(source), sharedWithGroups }

      // setSource(_formatteSource, {
      //   pages: pagesRes.data,
      //   blocks: blocksRes.data,
      // })

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
    const sources = Object.values(_sourcesDict)
    if (!sources.length) {
      return []
    }
    // first attempt to search based on the name property
    let _sources = sources
      .map(weightedSearch(query, 'name'))
      .filter(prefixSearchAll(query, 'name'))
      .sort((a, b) => (a.weight < b.weight ? 1 : -1))
      .slice(0, 4)
      .map((s) => (
        <DropdownListItem
          data-test-element="suggested-menu-sources"
          label={`${s.name.textValue} [${truncate(s.text.textValue, 30)}]`}
          key={s._id}
          onPress={() => onSourceSelected({ ...s, type: 'SOURCE' })}
        />
      ))
    // fall back to searching the text property
    if (!_sources.length) {
      _sources = sources
        .map(weightedSearch(query))
        .filter(prefixSearchAll(query))
        .sort((a, b) => (a.weight < b.weight ? 1 : -1))
        .slice(0, 4)
        .map((s) => (
          <DropdownListItem
            data-test-element="suggested-menu-sources"
            label={s.text.textValue}
            key={s._id}
            onPress={() => onSourceSelected({ ...s, type: 'SOURCE' })}
          />
        ))

      if (!_sources.length) {
        return []
      }
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

  const setCurrentSourceWithoutSuggestion = () =>
    setAtomicWithoutSuggestion({
      editor,
      state,
      setContent,
    })

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
    return (
      <View overflow="hidden">
        {_composeLocalSources(Object.values(sourcesRes.data)).concat(
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
        )}
      </View>
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
