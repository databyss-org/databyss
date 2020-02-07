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
import reducer from '../../state/page/reducer'
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

const EditorChildren = ({ setActiveBlockId }) => {
  const [editorState] = useEditorContext()
  const { activeBlockId } = editorState
  useEffect(
    () => {
      if (activeBlockId) {
        setActiveBlockId(activeBlockId)
      }
    },
    [activeBlockId]
  )
  return (
    <EditorPage autoFocus>
      <ContentEditable />
    </EditorPage>
  )
}

const Providers = ({ _initState, setActiveBlockId }) => (
  <TopicProvider initialState={topicInitialState} reducer={topicReducer}>
    <SourceProvider initialState={sourceInitialState} reducer={sourceReducer}>
      <NavigationProvider>
        <EditorProvider
          initialState={_initState}
          editableReducer={slateReducer}
          reducer={reducer}
        >
          <EditorChildren setActiveBlockId={setActiveBlockId} />
        </EditorProvider>
      </NavigationProvider>
    </SourceProvider>
  </TopicProvider>
)

const EditableTest = () => {
  const [active, setActive] = useState(false)
  const [blockSize, setBlockSize] = useState(SMALL)
  const [editableState, setEditbleState] = useState(generateState(blockSize))
  const [activeBlockId, onSetActiveBlockId] = useState(null)

  const setActiveBlockId = id => {
    onSetActiveBlockId(id)
  }

  const [ProviderComponent, setProviderComponent] = useState(
    <Providers _initState={editableState} setActiveBlockId={setActiveBlockId} />
  )
  const [providerKey, setProviderKey] = useState(1)

  useEffect(
    () => {
      setProviderKey(providerKey + 1)
      setActive(false)
      setEditbleState(generateState(blockSize))
    },
    [blockSize]
  )

  useEffect(
    () => {
      setProviderComponent(
        <Providers
          key={providerKey}
          _initState={editableState}
          setActiveBlockId={setActiveBlockId}
        />
      )
    },
    [providerKey]
  )

  const onBlockSizeClick = size => {
    onSetActiveBlockId(null)
    setTimeout(() => setBlockSize(size), 10)
  }

  return (
    <Grid>
      <Button
        onClick={() => onBlockSizeClick(SMALL)}
        disabled={blockSize === SMALL}
      >
        <Text>5 Blocks</Text>
      </Button>
      <Button
        onClick={() => onBlockSizeClick(MED)}
        disabled={blockSize === MED}
      >
        <Text>50 Blocks</Text>
      </Button>
      <Button
        onClick={() => onBlockSizeClick(LARGE)}
        disabled={blockSize === LARGE}
      >
        <Text>500 Blocks</Text>
      </Button>
      <Button data-test-min onClick={() => setActive(!active)}>
        <Text>{active ? 'Stop' : 'Start'}</Text>
      </Button>
      <View
        borderVariant="thinDark"
        paddingVariant="tiny"
        width={70}
        id="minimum"
      >
        {active && <FPSStats />}
      </View>
      <View borderVariant="thinDark" paddingVariant="tiny" id="activeBlockId">
        {activeBlockId}
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
