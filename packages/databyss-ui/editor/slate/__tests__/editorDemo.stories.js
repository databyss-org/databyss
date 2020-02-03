import React from 'react'
import { storiesOf } from '@storybook/react'
import { View } from '@databyss-org/ui/primitives'
import { ViewportDecorator } from '@databyss-org/ui/stories/decorators'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import fetchMock from 'fetch-mock'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import topicReducer, {
  initialState as topicInitialState,
} from '@databyss-org/services/topics/reducer'
import sourceReducer, {
  initialState as sourceInitialState,
} from '@databyss-org/services/sources/reducer'
import EditorProvider from '../../EditorProvider'
import EditorPage from '../../EditorPage'
import ContentEditable from '../page/ContentEditable'
import reducer from '../../state/page/reducer'
import emptyInitialState from '../../state/__tests__/emptyInitialState'
import slateReducer from '../page/reducer'

const EditableTest = () => (
  <View
    mb="medium"
    pt="medium"
    id="testtest"
    width="100%"
    height="100%"
    flexGrow={1}
  >
    <EditorPage>
      <ContentEditable height="100%" />
    </EditorPage>
  </View>
)

storiesOf('Demos|Editor', module)
  .addDecorator(ViewportDecorator)
  .add('Slate', () => {
    let data = {}
    fetchMock.restore().post((url, opt) => {
      if (url === 'http://localhost:5000/api/sources') {
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
