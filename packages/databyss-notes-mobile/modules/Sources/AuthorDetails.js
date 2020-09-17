import React from 'react'
import { useParams } from '@reach/router'

import { SourceCitationsLoader } from '@databyss-org/ui/components/Loaders'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
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
const AuthorDetails = () => {
  const { firstName, lastName } = useParams()

  // render methods
  const renderAuthorCitations = citations => {
    const authorCitations = buildAuthorCitationData(
      citations,
      firstName,
      lastName
    )

    const cleanCitations = authorCitations.filter(
      c =>
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
    <MobileView headerItems={buildHeaderItems(firstName, lastName)}>
      <SourceProvider>
        <SourceCitationsLoader>
          {citations => renderAuthorCitations(citations)}
        </SourceCitationsLoader>
      </SourceProvider>
    </MobileView>
  )

  return render()
}

export default AuthorDetails
