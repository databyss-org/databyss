import React, { useEffect, useRef } from 'react'
import { storiesOf } from '@storybook/react'
import { Global } from '@emotion/core'
import EditorProvider from '@databyss-org/ui/Editor/EditorProvider'
import slateReducer from '@databyss-org/ui/Editor/slate/page/reducer'
import reducer from '@databyss-org/ui/Editor/state/page/reducer'
import initialState from '@databyss-org/ui/Editor/state/__tests__/emptyInitialState'
import ContentEditable from '@databyss-org/ui/Editor/slate/page/ContentEditable'
import EditorPage from '@databyss-org/ui/Editor/EditorPage'
import { ViewportWrapper } from '../decorators'

const ProviderDecorator = storyFn => (
  <EditorProvider
    editableReducer={slateReducer}
    initialState={initialState}
    reducer={reducer}
  >
    <Global
      styles={{
        'html,body,#root': {
          height: '100%',
          cursor: 'text',
        },
      }}
    />
    {storyFn()}
  </EditorProvider>
)

const EditorDemo = () => {
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }, [])

  return (
    <ViewportWrapper height="100%" onClick={() => editorRef.current.focus()}>
      <EditorPage>
        <ContentEditable ref={editorRef} />
      </EditorPage>
    </ViewportWrapper>
  )
}

storiesOf('Editor//Demos', module)
  .addDecorator(ProviderDecorator)
  .add('Clean Slate', () => <EditorDemo />)
