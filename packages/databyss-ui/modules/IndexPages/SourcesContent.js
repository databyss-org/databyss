import React, { useState } from 'react'
import { CitationStyleOptions } from '@databyss-org/services/citations/constants'
import { getCitationStyleOption } from '@databyss-org/services/citations/lib'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { useBibliography } from '@databyss-org/data/pouchdb/hooks'
import { LoadingFallback } from '@databyss-org/ui/components'
import { DropDownControl } from '@databyss-org/ui/primitives'
import { AuthorsContent } from './AuthorsContent'

import { IndexPageView } from './IndexPageContent'
import { SourcesResults } from './SourcesResults'
import { pxUnits } from '../../theming/views'
import styled from '../../primitives/styled'

// styled components
const CitationStyleDropDown = styled(DropDownControl, () => ({
  width: pxUnits(120),
  alignSelf: 'end',
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
  const _queryParams = getQueryParams()
  if (_queryParams.length) {
    return <AuthorsContent query={_queryParams} />
  }

  const sortedSources = Object.values(sourcesRes.data).sort((a, b) =>
    a.source.text.textValue.toLowerCase() >
    b.source.text.textValue.toLowerCase()
      ? 1
      : -1
  )

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
    <IndexPageView path={['All Sources']}>
      <CitationStyleDropDown
        items={_citationStyleOptions}
        value={citationStyleOption}
        onChange={onCitationStyleChange}
      />
      <SourcesResults entries={sortedSources} />
    </IndexPageView>
  )
}
