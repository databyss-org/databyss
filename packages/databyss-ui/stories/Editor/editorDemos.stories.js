import React, { useEffect, useRef } from 'react'
import { storiesOf } from '@storybook/react'
import { Global } from '@emotion/core'
import EditorProvider from '@databyss-org/ui/editor/EditorProvider'
import slateReducer from '@databyss-org/ui/editor/slate/page/reducer'
import reducer from '@databyss-org/ui/editor/state/page/reducer'
import initialState from '@databyss-org/ui/editor/state/__tests__/emptyInitialState'
import ContentEditable from '@databyss-org/ui/editor/slate/page/ContentEditable'
import EditorPage from '@databyss-org/ui/editor/EditorPage'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'
import { ViewportWrapper } from '../decorators'

const EditorDemo = () => {
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }, [])

  return (
    <ViewportWrapper
      height="100%"
      backgroundColor="background.0"
      onClick={() => editorRef.current.focus()}
    >
      <Global
        styles={{
          'html,body,#root': {
            height: '100%',
            cursor: 'text',
          },
        }}
      />
      <NotifyProvider envPrefix="STORYBOOK">
        <EditorProvider
          editableReducer={slateReducer}
          initialState={initialState}
          reducer={reducer}
        >
          <EditorPage>
            <ContentEditable ref={editorRef} />
          </EditorPage>
        </EditorProvider>
      </NotifyProvider>
    </ViewportWrapper>
  )
}

storiesOf('Editor//Demos', module).add('Clean Slate', () => <EditorDemo />)
