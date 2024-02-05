import React, { useMemo, useState } from 'react'
import { CitationStyleOptions } from '@databyss-org/services/citations/constants'
import { getCitationStyleOption } from '@databyss-org/services/citations/lib'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { useBibliography } from '@databyss-org/data/pouchdb/hooks'
import { LoadingFallback } from '@databyss-org/ui/components'
import { DropDownControl } from '@databyss-org/ui/primitives'
import { IndexPageView } from './IndexPageContent'
import { SourcesResults } from './SourcesResults'
import { pxUnits } from '../../theming/views'
import styled from '../../primitives/styled'
import { composeAuthorName, filterBibliographyByAuthor } from '../../../databyss-services/sources/lib'
import { useUserPreferencesContext } from '../../hooks'

// styled components
const CitationStyleDropDown = styled(DropDownControl, () => ({
  width: pxUnits(120),
}))

export const SourcesContent = () => {
  const { isOnline } = useNotifyContext()
  const getTokensFromPath = useNavigationContext((c) => c.getTokensFromPath)
  const {
    getPreferredCitationStyle,
    setPreferredCitationStyle,
  } = useUserPreferencesContext()
  const preferredCitationStyle = getPreferredCitationStyle()
  const [citationStyleOption, setCitationStyleOption] = useState(
    getCitationStyleOption(preferredCitationStyle)
  )
  const _path = getTokensFromPath()
  let filterByAuthor
  if (_path.author) {
    filterByAuthor = [_path.author.firstName, _path.author.lastName]
  }
  const sourcesRes = useBibliography({
    formatOptions: {
      styleId: citationStyleOption.id,
    },
  })

  const onCitationStyleChange = (value) => {
    setCitationStyleOption(value)
    setPreferredCitationStyle(value.id)
  }

  if (!sourcesRes.isSuccess) {
    return <LoadingFallback queryObserver={sourcesRes} />
  }

  let _bibItems = sourcesRes.data
  let _authorFullName = null
  if (filterByAuthor) {
    _authorFullName = composeAuthorName(filterByAuthor[0], filterByAuthor[1])
    _bibItems = filterBibliographyByAuthor({
      items: _bibItems,
      author: { firstName: filterByAuthor[0], lastName: filterByAuthor[1] },
    })
  }

  let _citationStyleOptions = CitationStyleOptions
  // if we're offline, only show the current option and a message to go online
  if (!isOnline) {
    _citationStyleOptions = _citationStyleOptions.filter(
      (option) => option.id === citationStyleOption.id
    )
    _citationStyleOptions.push({
      label: 'Please go online to change the citation style',
      id: -1,
    })
  }

  return (
    <IndexPageView
      path={_authorFullName ? ['Authors', _authorFullName] : ['Bibliography']}
      key={_authorFullName}
      position="relative"
      menuChild={
        <CitationStyleDropDown
          items={_citationStyleOptions}
          value={citationStyleOption}
          onChange={onCitationStyleChange}
        />
      }
    >
      <SourcesResults entries={_bibItems} />
    </IndexPageView>
  )
  // }, [JSON.stringify(_path), sourcesRes.data])
}
