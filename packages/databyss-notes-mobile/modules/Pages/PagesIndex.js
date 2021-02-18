import React from 'react'
import { PageProvider } from '@databyss-org/services'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import { LoadingFallback } from '@databyss-org/ui/components'
import { MobileView } from '../Mobile'
import { buildListItems } from '../../utils/buildListItems'
import NoResultsView from '../../components/NoResultsView'
import ScrollableListView from '../../components/ScrollableListView'
import PagesMetadata from './PagesMetadata'

// consts
const headerItems = [PagesMetadata]

// component
const PagesIndex = () => {
  const pagesRes = usePages()
  if (!pagesRes.isSuccess) {
    return <LoadingFallback queryObserver={pagesRes} />
  }
  const listItems = buildListItems({
    data: pagesRes.data,
    baseUrl: '/pages',
    labelPropPath: 'name',
    icon: PagesMetadata.icon,
  })
  const render = () => (
    <PageProvider>
      <MobileView headerItems={headerItems}>
        {listItems.length ? (
          <ScrollableListView listItems={listItems} />
        ) : (
          <NoResultsView text="No page found" />
        )}
      </MobileView>
    </PageProvider>
  )

  return render()
}

export default PagesIndex
