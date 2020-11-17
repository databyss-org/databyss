import React, { useState, useEffect } from 'react'
import ObjectId from 'bson-objectid'

import {
  CROSSREF,
  GOOGLE_BOOKS,
  OPEN_LIBRARY,
} from '@databyss-org/services/catalog/constants'
import { prefixSearchAll } from '@databyss-org/services/block/filter'
import { Separator } from '@databyss-org/ui/primitives'
import { SourceCitationsLoader } from '@databyss-org/ui/components/Loaders'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'

import { useEditorContext } from '../../state/EditorProvider'

import { CatalogResults } from './'

export const LOCAL_SOURCES = 'LOCAL_SOURCES'

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
  const setSource = useSourceContext((c) => c && c.setSource)

  const addPageToCacheHeader = useSourceContext(
    (c) => c && c.addPageToCacheHeader
  )
  const { replace, state } = useEditorContext()
  const [suggestions, setSuggestsions] = useState()

  useEffect(() => {
    // reset menu when active state changes
    setResultsMode(LOCAL_SOURCES)
  }, [active])

  const onSourceSelected = (source) => {
    if (!source._id) {
      source._id = new ObjectId().toHexString()
      setSource(source)
    }

    // check document to see if page should be added to source cache
    if (state.blocks.filter((b) => b._id === source._id).length < 1) {
      addPageToCacheHeader(source._id, state.pageHeader._id)
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

  const onSourcesLoaded = (resources) => {
    if (!suggestions) {
      onSuggestionsChanged(Object.values(resources))
      setSuggestsions(resources)
    }
  }
  const _mode = resultsMode || LOCAL_SOURCES

  if (_mode === LOCAL_SOURCES) {
    return (
      <SourceCitationsLoader onLoad={onSourcesLoaded}>
        {(_sourceCitations) =>
          _composeLocalSources(_sourceCitations).concat(
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
          )
        }
      </SourceCitationsLoader>
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
