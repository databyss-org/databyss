import React, { useEffect, useRef } from 'react'
import { storiesOf } from '@storybook/react'
import { Global } from '@emotion/core'
import EditorProvider from '@databyss-org/ui/components/Editor/EditorProvider'
import slateReducer from '@databyss-org/ui/components/Editor/slate/reducer'
import initialState from '@databyss-org/ui/components/Editor/state/__tests__/emptyInitialState'
import ContentEditable from '@databyss-org/ui/components/Editor/slate/ContentEditable'
import EditorPage from '@databyss-org/ui/components/Editor/EditorPage'
import { View } from '@databyss-org/ui/primitives'
import { ViewportWrapper } from '../decorators'

const ProviderDecorator = storyFn => (
  <EditorProvider editableReducer={slateReducer} initialState={initialState}>
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
