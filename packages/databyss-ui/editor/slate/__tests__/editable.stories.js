import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Grid } from '@databyss-org/ui/primitives'
import { ViewportDecorator } from '@databyss-org/ui/stories/decorators'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import topicReducer, {
  initialState as topicInitialState,
} from '@databyss-org/services/topics/reducer'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import fetchMock from 'fetch-mock'

import sourceReducer, {
  initialState as sourceInitialState,
} from '@databyss-org/services/sources/reducer'
import EditorProvider, { useEditorContext } from '../../EditorProvider'
import EditorPage from '../../EditorPage'
import ContentEditable from '../page/ContentEditable'
import reducer, { getRawHtmlForBlock } from '../../state/page/reducer'
import initialState from '../../state/__tests__/initialState'
import emptyInitialState from '../../state/__tests__/emptyInitialState'
import slateReducer from '../page/reducer'

const _source = {
  _id: '5d64419f1cbc815583c35058',
  text: {
    textValue:
      'Stamenov, Language Structure, Discourse and the Access to Consciousness',
    ranges: [],
  },
  citations: [{ textValue: '', ranges: [] }],
  authors: [{ firstName: '', lastName: '' }],
}

const _topic = {
  _id: '5d7bbfb58a5f2f5dc1edfe7c',
  text: {
    textValue: 'topic',
    ranges: [],
  },
}

const Box = ({ children, ...others }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%" {...others}>
    {children}
  </View>
)

const EditableTest = () => {
  const [slateDocument, setSlateDocument] = useState({})
  const [editorState] = useEditorContext()
  const { activeBlockId, page, blocks } = editorState
  const editorDocument = {
    activeBlockId,
    pageBlocks: page.blocks.map(block => ({
      ...blocks[block._id],
      textValue: getRawHtmlForBlock(editorState, blocks[block._id]),
    })),
  }

  return (
    <Grid>
      <Box mb="medium" pt="medium" maxWidth="500px" flexShrink={1}>
        <EditorPage autoFocus>
          <ContentEditable onDocumentChange={setSlateDocument} />
        </EditorPage>
      </Box>
      <Box id="slateDocument" overflow="scroll" maxWidth="500px" flexShrink={1}>
        <pre>{JSON.stringify(slateDocument, null, 2)}</pre>
      </Box>
      <Box id="pageBlocks" overflow="scroll" maxWidth="500px" flexShrink={1}>
        <pre>{JSON.stringify(editorDocument, null, 2)}</pre>
      </Box>
    </Grid>
  )
}

storiesOf('Cypress//Tests', module)
  .addDecorator(ViewportDecorator)
  .add('Slate', () => {
    let data = {}
    fetchMock
      .restore()
      .post(url => {
        if (url === 'http://localhost:5000/api/sources') {
          //  data = JSON.parse(opt.body).data
          return true
        }
        return null
      }, 200)
      .get(url => {
        if (url.includes('http://localhost:5000/api/sources')) {
          return true
        }
        return null
      }, _source)
      .get(url => {
        if (url.includes('http://localhost:5000/api/topics')) {
          return true
        }
        return null
      }, _topic)
      .post((url, opt) => {
        if (url === 'http://localhost:5000/api/topics') {
          data = JSON.parse(opt.body).data
          return true
        }
        return null
      }, data)
    return (
      <TopicProvider initialState={topicInitialState} reducer={topicReducer}>
        <SourceProvider
          initialState={sourceInitialState}
          reducer={sourceReducer}
        >
          <NavigationProvider>
            <EditorProvider
              initialState={initialState}
              editableReducer={slateReducer}
              reducer={reducer}
            >
              <EditableTest />
            </EditorProvider>
          </NavigationProvider>
        </SourceProvider>
      </TopicProvider>
    )
  })
  .add('Slate - Empty', () => {
    let data = {}
    fetchMock
      .restore()
      .post((url, opt) => {
        if (url === 'http://localhost:5000/api/sources') {
          data = JSON.parse(opt.body).data
          return true
        }
        return null
      }, data)
      .post((url, opt) => {
        if (url === 'http://localhost:5000/api/topics') {
          data = JSON.parse(opt.body).data
          return true
        }
        return null
      }, data)
    return (
      <TopicProvider initialState={topicInitialState} reducer={topicReducer}>
        <SourceProvider
          initialState={sourceInitialState}
          reducer={sourceReducer}
        >
          <NavigationProvider>
            <EditorProvider
              initialState={emptyInitialState}
              editableReducer={slateReducer}
              reducer={reducer}
            >
              <EditableTest />
            </EditorProvider>
          </NavigationProvider>
        </SourceProvider>
      </TopicProvider>
    )
  })
