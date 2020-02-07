import React, { useState, useEffect } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Grid, Text, Button } from '@databyss-org/ui/primitives'
import { ViewportDecorator } from '@databyss-org/ui/stories/decorators'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import topicReducer, {
  initialState as topicInitialState,
} from '@databyss-org/services/topics/reducer'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import fetchMock from 'fetch-mock'
import FPSStats from './FPS'
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
import {
  generateState,
  SMALL,
  MED,
  LARGE,
} from './../../state/__tests__/_helpers.js'

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
  <View paddingVariant="tiny" width="100%" {...others}>
    {children}
  </View>
)

const Providers = ({ _initState }) => (
  <TopicProvider initialState={topicInitialState} reducer={topicReducer}>
    <SourceProvider initialState={sourceInitialState} reducer={sourceReducer}>
      <NavigationProvider>
        <EditorProvider
          initialState={_initState}
          editableReducer={slateReducer}
          reducer={reducer}
        >
          <EditorPage autoFocus>
            <ContentEditable />
          </EditorPage>
        </EditorProvider>
      </NavigationProvider>
    </SourceProvider>
  </TopicProvider>
)

const EditableTest = () => {
  const [active, setActive] = useState(false)
  const [blockSize, setBlockSize] = useState(SMALL)
  const [editableState, setEditbleState] = useState(generateState(blockSize))
  const [ProviderComponent, setProviderComponent] = useState(
    <Providers _initState={editableState} />
  )
  const [providerKey, setProviderKey] = useState(1)

  useEffect(
    () => {
      setProviderKey(providerKey + 1)
      setEditbleState(generateState(blockSize))
    },
    [blockSize]
  )

  useEffect(
    () => {
      setProviderComponent(
        <Providers key={providerKey} _initState={editableState} />
      )
    },
    [providerKey]
  )

  return (
    <Grid>
      <Button
        onClick={() => setBlockSize(SMALL)}
        disabled={blockSize === SMALL}
      >
        <Text>5 Blocks</Text>
      </Button>
      <Button onClick={() => setBlockSize(MED)} disabled={blockSize === MED}>
        <Text>50 Blocks</Text>
      </Button>
      <Button
        onClick={() => setBlockSize(LARGE)}
        disabled={blockSize === LARGE}
      >
        <Text>500 Blocks</Text>
      </Button>
      <Button onClick={() => setActive(!active)}>
        <Text>{active ? 'Stop' : 'Start'}</Text>
      </Button>
      <View borderVariant="thinDark" paddingVariant="tiny" width={70}>
        {active && <FPSStats id="minimum" />}
      </View>
      <Box mb="medium" pt="medium" flexShrink={1} key={blockSize}>
        {ProviderComponent}
      </Box>
    </Grid>
  )
}

storiesOf('Cypress//Tests', module)
  .addDecorator(ViewportDecorator)
  .add('Performance', () => {
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
    return <EditableTest />
  })
