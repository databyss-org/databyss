// import React from 'react'
// import { View } from '@databyss-org/ui/primitives'
// import { Viewport, Sidebar, PageContent } from '@databyss-org/ui'
// import Page from './Page'

// const Private = () => {
//   return (
//     <Sidebar>
//       <PageContent>
//         <Page />
//       </PageContent>
//     </Sidebar>
//   )
// }

// export default Private

import React from 'react'
import EditorProvider, {
  pageReducer,
} from '@databyss-org/ui/editor/EditorProvider'
import { PageProvider } from '@databyss-org/services'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import AutoSave from '@databyss-org/ui/editor/AutoSave'
import slateReducer from '@databyss-org/ui/editor/slate/page/reducer'
import EditorPage from '@databyss-org/ui/editor/EditorPage'
import SlateContentEditable from '@databyss-org/ui/editor/slate/page/ContentEditable'
import { View } from '@databyss-org/ui/primitives'
import { PageLoader } from '@databyss-org/ui/components/Loaders'
import { Viewport, Sidebar, PageContent } from '@databyss-org/ui'

const Private = () => {
  const { getSession } = useSessionContext()
  const { account } = getSession()

  return (
    <PageProvider>
      <SourceProvider>
        <TopicProvider>
          <PageLoader pageId={account.defaultPage}>
            {page => (
              <Sidebar>
                <PageContent>
                  <EditorProvider
                    initialState={page}
                    reducer={pageReducer}
                    editableReducer={slateReducer}
                  >
                    <AutoSave />
                    <EditorPage autoFocus>
                      <SlateContentEditable />
                    </EditorPage>
                  </EditorProvider>
                </PageContent>
              </Sidebar>
            )}
          </PageLoader>
        </TopicProvider>
      </SourceProvider>
    </PageProvider>
  )
}

export default Private
