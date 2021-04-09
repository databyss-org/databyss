import React, { useState } from 'react'
// import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
// import { ScrollView } from '@databyss-org/ui/primitives'
// import { PageProvider } from '@databyss-org/services'
// import EntryProvider from '@databyss-org/services/entries/EntryProvider'
// import IndexSourceContent from '@databyss-org/ui/components/SourcesContent/IndexSourceContent'
// import TopicProvider from '@databyss-org/services/topics/TopicProvider'
// import {
//   BlockRelationsLoader,
//   PagesLoader,
//   TopicLoader,
// } from '@databyss-org/ui/components/Loaders'
// import { MobileView } from '../Mobile'
// import { getScrollViewMaxHeight } from '../../utils/getScrollViewMaxHeight'

import TopicsMetadata from './TopicsMetadata'

const buildHeaderItems = (title, id) => [
  TopicsMetadata,
  {
    title,
    url: `${TopicsMetadata.url}/${id}`,
  },
]

// component
const TopicDetails = () => {
  // const { topicId } = useParams()

  // const [pageTitle, setPageTitle] = useState('Loading...')

  // // render methods
  // const renderTopicDetails = () => (
  //   <ScrollView maxHeight={getScrollViewMaxHeight()} pr="medium" py="large">
  //     <PageProvider>
  //       <PagesLoader>
  //         {() => (
  //           <EntryProvider>
  //             <BlockRelationsLoader atomicId={topicId}>
  //               {(relations) => <IndexSourceContent relations={relations} />}
  //             </BlockRelationsLoader>
  //           </EntryProvider>
  //         )}
  //       </PagesLoader>
  //     </PageProvider>
  //   </ScrollView>
  // )

  // const render = () => (
  //   <MobileView headerItems={buildHeaderItems(pageTitle, topicId)}>
  //     <TopicProvider>
  //       <TopicLoader topicId={topicId}>
  //         {(topic) => {
  //           setPageTitle(topic.text.textValue)
  //           return renderTopicDetails()
  //         }}
  //       </TopicLoader>
  //     </TopicProvider>
  //   </MobileView>
  // )

  // return render()
  return <div>topics detail section</div>
}

export default TopicDetails
