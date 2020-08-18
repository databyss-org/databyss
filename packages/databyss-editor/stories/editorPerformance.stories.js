import React, { useState, useEffect, useRef } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Text, Button } from '@databyss-org/ui/primitives'
import { ViewportDecorator } from '@databyss-org/ui/stories/decorators'
import fetchMock from 'fetch-mock'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import sourceReducer, {
  initialState as sourceInitialState,
} from '@databyss-org/services/sources/reducer'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import topicReducer, {
  initialState as topicInitialState,
} from '@databyss-org/services/topics/reducer'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import ContentEditable from '../components/ContentEditable'
import EditorProvider from '../state/EditorProvider'
import { sourceFixture, topicFixture } from './fixtures/refEntities'
import { SMALL, MED, LARGE, generateState } from './__tests__/__helpers'
import FPSStats from './__tests__/FPS'

const _res = {
  totalItems: 1,
  items: [
    {
      volumeInfo: {
        title: 'Jacques Derrida',
        authors: ['Geoffrey Bennington', 'Jacques Derrida'],
        publisher: 'University of Chicago Press',
        publishedDate: '1999-06-15',
      },
    },
  ],
}

const Box = ({ children, ...others }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%" {...others}>
    {children}
  </View>
)

const EditorWithProvider = () => {
  const [active, setActive] = useState(false)
  const [blockSize, setBlockSize] = useState('SMALL')
  const [providerKey, setProviderKey] = useState(1)
  const [editableState, setEditbleState] = useState(generateState(blockSize))
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState(null)
  // const [active, setActive] = useState(false)

  const timeDelta = useRef(null)

  const onDocumentChange = () => {
    // if document was loaded and timeDelta was set
    // get loading time
    if (
      //  loading &&
      timeDelta.current
    ) {
      window.requestAnimationFrame(() => {
        setLoading(false)
        const _delta = (Date.now() - timeDelta.current) / 1000
        // throttle double onChange events
        if (_delta < 10000) {
          setTime(_delta)
        }
        timeDelta.current = null
      })
    }
  }

  const onBlockSizeClick = size => {
    // use for laoding time calculation
    timeDelta.current = Date.now()
    setTime(null)
    //  setLoading(true)
    setBlockSize(size)
  }

  useEffect(
    () => {
      if (blockSize) {
        // force rerender
        window.requestAnimationFrame(() => setProviderKey(providerKey + 1))
        setEditbleState(generateState(blockSize))
      }
    },
    [blockSize]
  )

  const onKeyDown = () => {
    if (!timeDelta.current && !loading) {
      window.requestAnimationFrame(() => setTime(null))
      timeDelta.current = Date.now()
    }
  }

  return (
    <View maxWidth="900px">
      <View display="-webkit-box">
        <Button
          id="small-blocks"
          mr="small"
          onClick={() => onBlockSizeClick(SMALL)}
          disabled={blockSize === SMALL}
        >
          <Text>5 Blocks</Text>
        </Button>
        <Button
          id="med-blocks"
          mr="small"
          onClick={() => onBlockSizeClick(MED)}
          disabled={blockSize === MED}
        >
          <Text>50 Blocks</Text>
        </Button>
        <Button
          id="large-blocks"
          mr="small"
          onClick={() => onBlockSizeClick(LARGE)}
          disabled={blockSize === LARGE}
        >
          <Text>100 Blocks</Text>
        </Button>
        <Button mr="small" id="set-fps" onClick={() => setActive(!active)}>
          <Text>{active ? 'Stop' : 'Start FPS'}</Text>
        </Button>
        <Button mr="small" id="clear-blocks" onClick={() => setBlockSize(null)}>
          <Text>clear blocks</Text>
        </Button>
      </View>

      <View height="80px">
        <View display="-webkit-box" m="small">
          <Text mr="small" variant="uiTextNormal">
            LOADING TIME:
          </Text>
          <View id="loading-stats">
            {!time ? (
              <Text variant="uiTextNormal">LOADING</Text>
            ) : (
              <Text variant="uiTextNormal">{time}</Text>
            )}
          </View>
        </View>
        <View display="-webkit-box" m="small">
          <Text mr="small" variant="uiTextNormal">
            FPS(min):
          </Text>
          <View id="fps-stats">
            {active && (
              <Text variant="uiTextNormal">
                <FPSStats />
              </Text>
            )}
          </View>
        </View>
      </View>
      <Box key={providerKey} onKeyDown={onKeyDown} onMouseDown={onKeyDown}>
        {blockSize ? (
          <EditorProvider initialState={editableState}>
            <ContentEditable onDocumentChange={onDocumentChange} autofocus />
          </EditorProvider>
        ) : (
          <Text>Click on blocks to load</Text>
        )}
      </Box>
    </View>
  )
}

const EditorWithModals = () => (
  <TopicProvider initialState={topicInitialState} reducer={topicReducer}>
    <SourceProvider initialState={sourceInitialState} reducer={sourceReducer}>
      <NavigationProvider>
        <EditorWithProvider initialState={generateState('SMALL')} />
      </NavigationProvider>
    </SourceProvider>
  </TopicProvider>
)

storiesOf('Selenium//Tests', module)
  .addDecorator(ViewportDecorator)
  .add('Slate 5 - Editor Performance', () => {
    fetchMock
      .restore()
      .post(url => {
        if (url.includes('/api/sources') || url.includes('/api/topics')) {
          return true
        }
        return null
      }, 200)
      .get(url => {
        if (url.includes('/api/sources')) {
          return true
        }
        return null
      }, sourceFixture)
      .get(url => {
        if (url.includes('/api/topics')) {
          return true
        }
        return null
      }, topicFixture)
      .get(url => {
        if (url.includes('googleapis')) {
          return true
        }
        return null
      }, _res)

    return <EditorWithModals />
  })
