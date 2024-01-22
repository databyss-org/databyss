import React, { useMemo, useState } from 'react'
import { CitationStyleOptions } from '@databyss-org/services/citations/constants'
import { getCitationStyleOption } from '@databyss-org/services/citations/lib'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { useBibliography } from '@databyss-org/data/pouchdb/hooks'
import { LoadingFallback } from '@databyss-org/ui/components'
import { DropDownControl } from '@databyss-org/ui/primitives'
import {
  filterBibliographyByAuthor,
  sortBibliography,
} from '@databyss-org/services/sources/lib'

import { IndexPageView } from './IndexPageContent'
import { SourcesResults } from './SourcesResults'
import { pxUnits } from '../../theming/views'
import styled from '../../primitives/styled'
import { composeAuthorName } from '../../../databyss-services/sources/lib'
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
  const sourcesRes = useBibliography({
    formatOptions: {
      styleId: citationStyleOption.id,
    },
  })

  const onCitationStyleChange = (value) => {
    setCitationStyleOption(value)
    setPreferredCitationStyle(value.id)
  }

  const _path = getTokensFromPath()

  return useMemo(() => {
    if (!sourcesRes.isSuccess) {
      return <LoadingFallback queryObserver={sourcesRes} />
    }

    // if author is provided in the url `.../sources?firstName=''&lastName='' render authors
    let _authorFirstName = null
    let _authorLastName = null
    let _authorFullName = null
    if (_path.author) {
      _authorFirstName = _path.author.firstName
      _authorLastName = _path.author.lastName
      _authorFullName = composeAuthorName(_authorFirstName, _authorLastName)
    }

    const sortedSources = sortBibliography(Object.values(sourcesRes.data))

    const filteredSources = _authorFullName
      ? filterBibliographyByAuthor({
          items: sortedSources,
          author: { firstName: _authorFirstName, lastName: _authorLastName },
        })
      : sortedSources

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
        <SourcesResults entries={filteredSources} />
      </IndexPageView>
    )
  }, [JSON.stringify(_path), sourcesRes.data])
}
