import React from 'react'
import EditorProvider from '@databyss-org/ui/editor/EditorProvider'
import PageProvider, {
  PageLoader,
} from '@databyss-org/services/pages/PageProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import AutoSave from '@databyss-org/ui/editor/AutoSave'
import slateReducer from '@databyss-org/ui/editor/slate/page/reducer'
import EditorPage from '@databyss-org/ui/editor/EditorPage'
import SlateContentEditable from '@databyss-org/ui/editor/slate/page/ContentEditable'

const Page = () => {
  const { getSession } = useSessionContext()
  const { account } = getSession()

  return (
    <PageProvider>
      <SourceProvider>
        <PageLoader pageId={account.defaultPage}>
          {page => (
            <EditorProvider initialState={page} editableReducer={slateReducer}>
              <AutoSave />
              <EditorPage autoFocus>
                <SlateContentEditable />
              </EditorPage>
            </EditorProvider>
          )}
        </PageLoader>
      </SourceProvider>
    </PageProvider>
  )
}

export default Page
