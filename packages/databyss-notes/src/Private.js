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
import { PageLoader } from '@databyss-org/ui/components/Loaders'
import { Sidebar, PageContent } from '@databyss-org/ui'
import { View, Grid } from '@databyss-org/ui/primitives'

const Private = () => {
  const { getSession } = useSessionContext()
  const { account } = getSession()

  return (
    <PageProvider>
      <SourceProvider>
        <TopicProvider>
          <View flexDirection="row" display="flex" width="100vw">
            <Sidebar />
            <PageContent />
          </View>
        </TopicProvider>
      </SourceProvider>
    </PageProvider>
  )
}

export default Private
