import React, { useState } from 'react'
import { PageLoader } from '@databyss-org/ui/components/Loaders'
import { View } from '@databyss-org/ui/primitives'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import PageHeader from './PageHeader'
import PageBody from './PageBody'

const PageContent = () => {
  const { getSession } = useSessionContext()
  const { account } = getSession()

  const [readOnly, setReadOnly] = useState(false)

  // TODO:
  // TEXT CONTROL SHOULD ACCEPT TEXT VARIANT

  const onHeaderClick = bool => {
    if (readOnly !== bool) {
      setReadOnly(bool)
    }
  }

  /*
  use same route to update name, just pass it name 
  */

  return (
    <View p="medium" flex="1">
      <PageLoader pageId={account.defaultPage}>
        {page => (
          <View>
            <PageHeader isFocused={onHeaderClick} />
            <PageBody page={page} readOnly={readOnly} />
            {/* <EditorProvider
              initialState={page}
              reducer={pageReducer}
              editableReducer={slateReducer}
            >
              {!readOnly && <AutoSave />}
              <EditorPage autoFocus>
                <SlateContentEditable readOnly={readOnly} />
              </EditorPage>
            </EditorProvider> */}
          </View>
        )}
      </PageLoader>
    </View>
  )
}

export default PageContent
