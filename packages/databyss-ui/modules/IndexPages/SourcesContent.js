import React, { useState } from 'react'
import { CitationStyleOptions } from '@databyss-org/services/citations/constants'
// import { createIndexPageEntries } from '@databyss-org/services/entries/util'
import { getCitationStyleOption } from '@databyss-org/services/citations/lib'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { useBibliography } from '@databyss-org/data/pouchdb/hooks'
// import { BlockType } from '@databyss-org/editor/interfaces'
import { LoadingFallback } from '@databyss-org/ui/components'
import { DropDownControl, pxUnits, styled } from '@databyss-org/ui/primitives'
import { AuthorsContent } from './AuthorsContent'

import { IndexPageView } from './IndexPageContent'
import { SourcesResults } from './SourcesResults'

// styled components
const CitationStyleDropDown = styled(DropDownControl, () => ({
  width: pxUnits(120),
  alignSelf: 'end',
}))

export const SourcesContent = () => {
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
    styleId: citationStyleOption.id,
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

  return (
    <IndexPageView path={['All Sources']}>
      <CitationStyleDropDown
        items={CitationStyleOptions}
        value={citationStyleOption}
        onChange={onCitationStyleChange}
      />
      <SourcesResults entries={sortedSources} />
    </IndexPageView>
  )
}
