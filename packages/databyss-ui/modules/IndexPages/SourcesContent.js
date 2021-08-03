import React, { useState } from 'react'
import { CitationStyleOptions } from '@databyss-org/services/citations/constants'
import { getCitationStyleOption } from '@databyss-org/services/citations/lib'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { useBibliography } from '@databyss-org/data/pouchdb/hooks'
import { LoadingFallback } from '@databyss-org/ui/components'
import { DropDownControl } from '@databyss-org/ui/primitives'

import { IndexPageView } from './IndexPageContent'
import { SourcesResults } from './SourcesResults'
import { pxUnits } from '../../theming/views'
import styled from '../../primitives/styled'
import {
  composeAuthorName,
  isCurrentAuthor,
} from '../../../databyss-services/sources/lib'

// styled components
const CitationStyleDropDown = styled(DropDownControl, () => ({
  width: pxUnits(120),
}))

export const SourcesContent = () => {
  const { isOnline } = useNotifyContext()
  const getQueryParams = useNavigationContext((c) => c.getQueryParams)
  const getPreferredCitationStyle = useSourceContext(
    (c) => c.getPreferredCitationStyle
  )
  const setPreferredCitationStyle = useSourceContext(
    (c) => c.setPreferredCitationStyle
  )
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

  if (!sourcesRes.isSuccess) {
    return <LoadingFallback queryObserver={sourcesRes} />
  }

  // if author is provided in the url `.../sources?firstName=''&lastName='' render authors
  let _authorFirstName = null
  let _authorLastName = null
  let _authorFullName = null
  const _queryParams = getQueryParams()
  const params = new URLSearchParams(_queryParams)
  if (_queryParams.length) {
    _authorFirstName = decodeURIComponent(params.get('firstName'))
    _authorLastName = decodeURIComponent(params.get('lastName'))
    _authorFullName = composeAuthorName(_authorFirstName, _authorLastName)
  }

  const sortedSources = Object.values(sourcesRes.data).sort((a, b) =>
    a.source.text.textValue.toLowerCase() >
    b.source.text.textValue.toLowerCase()
      ? 1
      : -1
  )

  const filteredSources = _authorFullName
    ? sortedSources.filter((s) =>
        isCurrentAuthor(
          s.source.detail?.authors,
          _authorFirstName,
          _authorLastName
        )
      )
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
}
