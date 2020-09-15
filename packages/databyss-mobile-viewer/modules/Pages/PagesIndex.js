import React from 'react'

import { MobileView } from '@databyss-org/ui/primitives'
import { PageProvider } from '@databyss-org/services'
import { PagesLoader } from '@databyss-org/ui/components/Loaders'

import { buildListItems } from '../../utils/buildListItems'
import NoResultsView from '../../components/NoResultsView'
import ScrollableListView from '../../components/ScrollableListView'

import PagesMetadata from './PagesMetadata'

// consts
const headerItems = [PagesMetadata]

// component
const PagesIndex = () => {
  const render = () => (
    <PageProvider>
      <MobileView headerItems={headerItems}>
        <PagesLoader>
          {pages => {
            const listItems = buildListItems({
              data: pages,
              baseUrl: '/pages',
              labelPropPath: 'name',
              icon: PagesMetadata.icon,
            })

            return listItems.length ? (
              <ScrollableListView listItems={listItems} />
            ) : (
              <NoResultsView text="No page found" />
            )
          }}
        </PagesLoader>
      </MobileView>
    </PageProvider>
  )

  return render()
}

export default PagesIndex
