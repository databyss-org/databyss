import React from 'react'
import { storiesOf } from '@storybook/react'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import sourceReducer, {
  initialState as sourceInitialState,
} from '@databyss-org/services/sources/reducer'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import topicReducer, {
  initialState as topicInitialState,
} from '@databyss-org/services/topics/reducer'
import { ViewportDecorator } from '@databyss-org/ui/stories/decorators'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import ContentEditable from '../components/ContentEditable'
import EditorProvider from '../state/EditorProvider'
import basicFixture from './fixtures/basic'
import fetchMock from 'fetch-mock'

const _source = {
  _id: '5e3b2000fda293001813b1d6',
  text: {
    textValue:
      'Stamenov, Language Structure, Discourse and the Access to Consciousness',
    ranges: [],
  },
  citations: [{ textValue: '', ranges: [] }],
  authors: [{ firstName: '', lastName: '' }],
}

const _topic = {
  _id: '5e3b1bc48fb28680fe26437d',
  text: {
    textValue: 'topic',
    ranges: [],
  },
}

const Editor = ({ initialState }) => (
  <EditorProvider initialState={initialState}>
    <ContentEditable />
  </EditorProvider>
)

const EditorWithProviders = ({ initialState }) => (
  <TopicProvider initialState={topicInitialState} reducer={topicReducer}>
    <SourceProvider initialState={sourceInitialState} reducer={sourceReducer}>
      <NavigationProvider>
        <Editor initialState={initialState} />
      </NavigationProvider>
    </SourceProvider>
  </TopicProvider>
)

storiesOf('Slate//Slate 5 Implementation', module)
  .addDecorator(ViewportDecorator)
  .add('Editor', () => {
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
    return <EditorWithProviders initialState={basicFixture} />
  })
