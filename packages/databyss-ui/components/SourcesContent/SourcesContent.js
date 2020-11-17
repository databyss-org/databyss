import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Router } from '@reach/router'

import { CitationStyleOptions } from '@databyss-org/services/citations/constants'
import { createIndexPageEntries } from '@databyss-org/services/entries/util'
import { getCitationStyleOption } from '@databyss-org/services/citations/lib'
import { SourceCitationsLoader } from '@databyss-org/ui/components/Loaders'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import AuthorCitations from '@databyss-org/ui/components/SourcesContent/AuthorCitations'
import AuthorsContent from '@databyss-org/ui/components/SourcesContent/AuthorsContent'
import SourcesCitations from '@databyss-org/ui/components/SourcesContent/SourcesCitations'

import { DropDownControl, pxUnits, styled } from '../../primitives'

import IndexPageContent from '../PageContent/IndexPageContent'

import IndexSourcePageEntries from './IndexSourcePageEntries'

// styled components
const CitationStyleDropDown = styled(DropDownControl, () => ({
  width: pxUnits(120),
  alignSelf: 'end',
}))

// utils
const buildSortedSources = (sourceCitations) => {
  const sourcesData = Object.values(sourceCitations).map((value) =>
    createIndexPageEntries({
      id: value._id,
      text: value.text,
      citation: value.citation,
      type: 'sources',
    })
  )

  const sortedSources = sourcesData.sort((a, b) =>
    a.text.textValue.toLowerCase() > b.text.textValue.toLowerCase() ? 1 : -1
  )

  return sortedSources
}

// components
export const SourcesRouter = () => (
  <Router>
    <SourcesContent path="/" />
    <SourcesCitations path="/:query" />
    <AuthorsContent path="/authors" />
  </Router>
)

const SourcesContent = () => {
  const navigate = useNavigationContext((c) => c.navigate)

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

  const onCitationStyleChange = (value) => {
    setCitationStyleOption(value)
    setPreferredCitationStyle(value.id)
  }

  // if author is provided in the url `.../sources?firstName=''&lastName='' render authors
  const _queryParams = getQueryParams()
  if (Object.keys(_queryParams).length) {
    return <AuthorCitations query={_queryParams} />
  }

  // render methods
  const renderBody = (sources, navigate) => {
    const sortedSources = buildSortedSources(sources)

    const onSourceClick = (source) => navigate(`/sources/${source.id}`)

    return (
      <IndexPageContent title="All Sources">
        <Helmet>
          <meta charSet="utf-8" />
          <title>All Sources</title>
        </Helmet>
        <CitationStyleDropDown
          items={CitationStyleOptions}
          value={citationStyleOption}
          onChange={onCitationStyleChange}
        />
        <IndexSourcePageEntries
          onClick={onSourceClick}
          entries={sortedSources}
        />
      </IndexPageContent>
    )
  }

  const render = () => (
    <SourceCitationsLoader filtered>
      {(source) => renderBody(source, navigate)}
    </SourceCitationsLoader>
  )

  return render()
}

export default SourcesContent
