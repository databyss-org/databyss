import { LoremIpsum } from 'lorem-ipsum'
import words from 'an-array-of-english-words'
import ObjectId from 'bson-objectid'
import cloneDeep from 'clone-deep'

export const SMALL = 'SMALL'
export const MED = 'MED'
export const LARGE = 'LARGE'

const testWords = words.filter(d => /\b[a-z]{1,6}\b/.test(d))

export const getBlockSize = size =>
  ({
    SMALL: 5,
    MED: 50,
    LARGE: 100,
  }[size])

const ipsum = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
  words: testWords,
})

const initialState = {
  preventDefault: false,
  operations: [],
  newEntities: [],
  selection: {
    // _id: new ObjectID().toHexString(),
    anchor: {
      index: 0,
      offset: 0,
    },
    focus: {
      index: 0,
      offset: 0,
    },
  },
  blocks: [],
  pageHeader: {
    _id: ObjectId().toHexString(),
    name: 'test document',
  },
}

const generateBlock = (state, type, index) => {
  const _state = state

  // const refId = ObjectId().toHexString()
  const _id = ObjectId().toHexString()

  _state.blocks[index] = {
    type,
    _id,
    text: {
      textValue: ipsum.generateParagraphs(2),
      ranges: [],
    },
  }

  return _state
}

export const generateState = size => {
  const blockSize = getBlockSize(size)
  const types = ['ENTRY', 'SOURCE', 'TOPIC']
  let _state = cloneDeep(initialState)
  for (let i = 0; i < blockSize; i += 1) {
    const _type = types[Math.floor(Math.random() * types.length)]
    _state = generateBlock(_state, _type, i)
  }
  return _state
}

export const sanitizeEditorChildren = children =>
  children.map(node => ({
    type: node.type,
    children: node.children.map(c => {
      const _textNode = { text: c.text }
      if (c.bold) {
        _textNode.bold = true
      }
      if (c.italic) {
        _textNode.italic = true
      }
      if (c.location) {
        _textNode.location = true
      }

      return _textNode
    }),
  }))
