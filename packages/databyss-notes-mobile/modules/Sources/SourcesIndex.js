import React from 'react'
import { uid } from '@databyss-org/data/lib/uid'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
import { useBlocks } from '@databyss-org/data/pouchdb/hooks'

import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import { LoadingFallback } from '@databyss-org/ui/components'
import { getAuthorsFromSources } from '@databyss-org/services/lib/util'
import {
  TabbedContent,
  TabHeight,
} from '@databyss-org/ui/components/TabbedContent'
import { MobileView } from '../Mobile'
import { buildListItems } from '../../utils/buildListItems'
import { getScrollViewMaxHeight } from '../../utils/getScrollViewMaxHeight'
import { parseLocation } from '../../utils/parseLocation'
import NoResultsView from '../../components/NoResultsView'
import ScrollableListView from '../../components/ScrollableListView'
import SourcesTabItems from '../../constants/SourcesTabItems'
import AuthorDetails from './AuthorDetails'

import SourcesMetadata from './SourcesMetadata'

const getAuthorName = (value) => {
  const firstName = value.firstName?.textValue
  const lastName = value.lastName?.textValue
  if (lastName && firstName) {
    return `${lastName}, ${firstName}`
  }
  return lastName || firstName
}

// utils
const buildAuthorList = (data) => {
  const response = []

  const keys = Object.keys(data)
  keys.forEach((key) => {
    const element = data[key]
    const _url = `firstName=${
      element?.firstName ? element.firstName.textValue : ''
    }&lastName=${element?.lastName ? element.lastName.textValue : ''}`
    const _label = getAuthorName(element)
    response.push({
      _id: uid(),
      label: _label,
      href: `/sources/authors?${_url}`,
      // href: `/sources/authors/${firstName}/${lastName}`,
      icon: <AuthorSvg />,
    })
  })

  return sortEntriesAtoZ(response, 'label')
}

const getSourcesViewMaxHeight = () => getScrollViewMaxHeight() - TabHeight

// consts
const headerItems = [SourcesMetadata]

// component
const SourcesIndex = () => {
  const blocksRes = useBlocks('SOURCE')

  const navigationContext = useNavigationContext()

  const getQueryParams = useNavigationContext((c) => c.getQueryParams)

  const _queryParams = getQueryParams()

  if (!blocksRes.isSuccess) {
    return <LoadingFallback queryObserver={blocksRes} />
  }

  const sources = Object.values(blocksRes.data)
  const authors = getAuthorsFromSources(sources)

  if (Object.keys(_queryParams).length) {
    return <AuthorDetails query={_queryParams} />
  }

  const { location } = navigationContext

  const onTabbedContentChange = (itemId, itemIndex) => {
    const tabItem = SourcesTabItems[itemIndex]
    navigationContext.navigate(tabItem.url)
  }

  // // render methods
  const renderSourcesList = () => {
    const listItems = buildListItems({
      data: sources,
      baseUrl: '/sources',
      labelPropPath: 'text.textValue',
      icon: SourcesMetadata.icon,
    })

    return listItems.length ? (
      <ScrollableListView
        maxHeight={getSourcesViewMaxHeight()}
        listItems={listItems}
      />
    ) : (
      <NoResultsView text="No source found" />
    )
  }

  const renderAuthorsList = () => {
    const listItems = buildAuthorList(authors)

    return listItems.length ? (
      <ScrollableListView
        maxHeight={getSourcesViewMaxHeight()}
        listItems={listItems}
      />
    ) : (
      <NoResultsView text="No author found" />
    )
  }

  const render = () => {
    const details = parseLocation(location)

    return (
      <SourceProvider>
        <MobileView headerItems={headerItems}>
          <TabbedContent
            tabItems={SourcesTabItems}
            panels={[renderSourcesList(), renderAuthorsList()]}
            onChange={onTabbedContentChange}
            selectedIndex={details.navDepth}
          />
        </MobileView>
      </SourceProvider>
    )
  }

  // return <div>test</div>
  return render()
}

export default SourcesIndex
