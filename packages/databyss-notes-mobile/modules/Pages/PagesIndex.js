import React from 'react'
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
  console.log('[PagesIndex]')
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
    <MobileView headerItems={headerItems}>
      {listItems.length ? (
        <ScrollableListView listItems={listItems} />
      ) : (
        <NoResultsView text="No page found" />
      )}
    </MobileView>
  )

  return render()
}

export default PagesIndex
