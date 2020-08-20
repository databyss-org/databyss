import React, { useState, useEffect } from 'react'
import ObjectId from 'bson-objectid'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { SourceCitationsLoader } from '@databyss-org/ui/components/Loaders'
import { Separator } from '@databyss-org/ui/primitives'
import { prefixSearch } from '@databyss-org/services/block/filter'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { useEditorContext } from '../../state/EditorProvider'
import { CatalogResults } from './'

export const LOCAL_SOURCES = 'LOCAL_SOURCES'
export const OPEN_LIBRARY = 'OPEN_LIBRARY'
export const CROSSREF = 'CROSSREF'
export const GOOGLE_BOOKS = 'GOOGLE_BOOKS'

const SuggestSources = ({ query, dismiss, focusEditor, active, ...others }) => {
  const setSource = useSourceContext(c => c && c.setSource)
  const { replace } = useEditorContext()
  const [mode, setMode] = useState(LOCAL_SOURCES)

  useEffect(
    () => {
      // reset menu when active state changes
      setMode(LOCAL_SOURCES)
    },
    [active]
  )

  const onSourceSelected = source => {
    if (!source._id) {
      source._id = new ObjectId().toHexString()
      setSource(source)
    }
    replace([source])
    dismiss()
  }

  const _composeLocalSources = _sourcesDict => {
    let _sources = Object.values(_sourcesDict)
    if (!_sources.length) {
      return []
    }
    _sources = _sources
      .filter(prefixSearch(query))
      .slice(0, 4)
      .map(s => (
        <DropdownListItem
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
      action: 'OPEN_LIBRARY',
      label: 'Search Open Library',
    },
    {
      action: 'CROSSREF',
      label: 'Search CrossRef',
    },
    {
      action: 'GOOGLE_BOOKS',
      label: 'Search Google Books',
    },
  ]

  if (mode === LOCAL_SOURCES) {
    return (
      <SourceCitationsLoader>
        {_sourceCitations =>
          _composeLocalSources(_sourceCitations).concat(
            _menuItems.map(menuItem => (
              <DropdownListItem
                {...menuItem}
                key={menuItem.action}
                onPress={() => {
                  setMode(menuItem.action)
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
      type={mode}
      query={query}
      selectSource={onSourceSelected}
      dismiss={dismiss}
      {...others}
    />
  )
}

export default SuggestSources
