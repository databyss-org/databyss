import React from 'react'
import ObjectId from 'bson-objectid'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { SourceCitationsLoader } from '@databyss-org/ui/components/Loaders'
import { Separator } from '@databyss-org/ui/primitives'
import { prefixSearch } from '@databyss-org/services/block/filter'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { useEditorContext } from '../../state/EditorProvider'

const SuggestSources = ({ query, dismiss }) => {
  const setSource = useSourceContext(c => c && c.setSource)
  const { replace } = useEditorContext()

  const onSourceSelected = source => {
    if (!source._id) {
      source._id = new ObjectId().toHexString()
      setSource(source)
    }
    replace([source])
    dismiss()
  }

  const _composeLocalSources = _sourcesDict => {
    const _sources = Object.values(_sourcesDict)
    if (!_sources.length) {
      return []
    }
    return _sources
      .filter(prefixSearch(query))
      .map(s => (
        <DropdownListItem
          menuItem={{ label: s.text.textValue }}
          key={s._id}
          onPress={() => onSourceSelected({ ...s, type: 'SOURCE' })}
        />
      ))
      .concat(<Separator color="border.3" spacing="extraSmall" key="sep" />)
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

  return (
    <SourceCitationsLoader>
      {_sourceCitations =>
        _composeLocalSources(_sourceCitations).concat(
          _menuItems.map(menuItem => (
            <DropdownListItem
              menuItem={menuItem}
              key={menuItem.action}
              onPress={e => {
                console.log(menuItem.action)
              }}
            />
          ))
        )
      }
    </SourceCitationsLoader>
  )
}

export default SuggestSources
