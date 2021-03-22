import React, { useState, useEffect } from 'react'
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

import { useEditorContext } from '../../state/EditorProvider'

import { CatalogResults } from './'

export const LOCAL_SOURCES = 'LOCAL_SOURCES'

export const formatSource = (value) => {
  const _value = JSON.parse(JSON.stringify(value))
  // format year
  const year = value?.detail?.year?.textValue
  if (year) {
    _value.detail.year.textValue = year.toString()
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
  ...others
}) => {
  const sourcesRes = useBlocksInPages(BlockType.Source)
  const { replace } = useEditorContext()
  const [suggestions, setSuggestsions] = useState()
  const { isOnline } = useNotifyContext()

  useEffect(() => {
    // reset menu when active state changes
    setResultsMode(LOCAL_SOURCES)
  }, [active])

  const onSourceSelected = (source) => {
    if (!source._id) {
      source._id = uid()
      setSource(formatSource(source))
    }

    replace([source])
    dismiss()
  }

  const _composeLocalSources = (_sourcesDict) => {
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
          label={s.text.textValue}
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
