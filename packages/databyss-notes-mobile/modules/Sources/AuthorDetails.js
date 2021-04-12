import React, { useState } from 'react'
import { getSourceCitations } from '@databyss-org/services/sources'
import { LoadingFallback } from '@databyss-org/ui/components'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import { MobileView } from '../Mobile'
import { buildAuthorCitationData } from '../../utils/buildAuthorCitationData'
import { buildListItems } from '../../utils/buildListItems'
import NoResultsView from '../../components/NoResultsView'
import ScrollableListView from '../../components/ScrollableListView'

import SourcesMetadata from './SourcesMetadata'

const buildHeaderItems = (firstName, lastName) => [
  SourcesMetadata,
  {
    title: `${firstName} ${lastName}`,
    url: `${SourcesMetadata.url}/authors/${firstName}/${lastName}`,
  },
]

// component
const AuthorDetails = ({ query }) => {
  const params = new URLSearchParams(query)

  const authorQueryFirstName = decodeURIComponent(params.get('firstName'))
  const authorQueryLastName = decodeURIComponent(params.get('lastName'))
  const [citations, setCitations] = useState(null)

  getSourceCitations().then((_citations) => setCitations(_citations))

  if (!citations) {
    return <LoadingFallback queryObserver={citations} />
  }

  // render methods
  const renderAuthorCitations = () => {
    const authorCitations = buildAuthorCitationData(
      citations,
      authorQueryFirstName,
      authorQueryLastName
    )

    const cleanCitations = authorCitations.filter(
      (c) =>
        Object.prototype.hasOwnProperty.call(c, 'id') &&
        Object.prototype.hasOwnProperty.call(c, 'text')
    )

    const listItems = buildListItems({
      data: cleanCitations,
      baseUrl: '/sources',
      labelPropPath: 'text',
      icon: <SourceSvg />,
    })

    return listItems.length ? (
      <ScrollableListView listItems={listItems} />
    ) : (
      <NoResultsView text="No citation found" />
    )
  }

  const render = () => (
    <MobileView
      headerItems={buildHeaderItems(authorQueryFirstName, authorQueryLastName)}
    >
      {renderAuthorCitations(citations)}
    </MobileView>
  )

  return render()
}

export default AuthorDetails
