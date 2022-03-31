import { LoremIpsum } from 'lorem-ipsum'
import words from 'an-array-of-english-words'
import ObjectId from 'bson-objectid'
import cloneDeep from 'clone-deep'

export const SMALL = 'SMALL'
export const MED = 'MED'
export const LARGE = 'LARGE'

const testWords = words.filter((d) => /\b[a-z]{1,6}\b/.test(d))

export const getBlockSize = (size) =>
  ({
    SMALL: 5,
    MED: 50,
    LARGE: 100,
  }[size])

const ipsum = new LoremIpsum({
  sentencesPerParagraph: {
    max: 6,
    min: 2,
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
  removedEntities: [],
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

  const _textVal = ipsum.generateParagraphs(2)

  const rangeTypes = ['bold', 'location', 'italic']

  const numberOfRanges = Math.floor(Math.random() * (_textVal.length / 35))

  const generateRange = (string) => {
    const _length = string.length
    // generate range type
    const _rangeType = rangeTypes[Math.floor(Math.random() * rangeTypes.length)]
    // generate offset
    const _offset = Math.floor(Math.random() * _length)
    const _rangeLength = Math.floor((Math.random() * (_length - _offset)) / 6)
    const _range = {
      marks: [_rangeType],
      offset: _offset,
      length: _rangeLength,
    }
    return _range
  }

  const ranges = []

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfRanges; i++) {
    ranges.push(generateRange(_textVal))
  }

  _state.blocks[index] = {
    type,
    _id,
    text: {
      textValue: ipsum.generateParagraphs(2),
      ranges,
    },
  }

  return _state
}

export const generateState = (size) => {
  const blockSize = getBlockSize(size)
  const types = ['ENTRY', 'SOURCE', 'TOPIC', 'ENTRY', 'ENTRY', 'ENTRY']
  let _state = cloneDeep(initialState)
  for (let i = 0; i < blockSize; i += 1) {
    const _type = types[Math.floor(Math.random() * types.length)]
    _state = generateBlock(_state, _type, i)
  }
  return _state
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export const sanitizeEditorChildren = (
  children,
  { pruneSelection } = { pruneSelection: false }
) => {
  let _sano = children
  if (pruneSelection) {
    const { selection, ..._children } = children
    _sano = _children
  }
  return _sano.map((node) => ({
    type: node.type,
    children: node.children.map((c) => {
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
}

export const cleanUrl = (url) => url.replace(/[\u{0080}-\u{FFFF}]/gu, '')
