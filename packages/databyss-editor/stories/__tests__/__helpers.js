import { LoremIpsum } from 'lorem-ipsum'
import ObjectId from 'bson-objectid'
import cloneDeep from 'clone-deep'

export const SMALL = 'SMALL'
export const MED = 'MED'
export const LARGE = 'LARGE'
export const X_LARGE = 'X_LARGE'

export const getBlockSize = size =>
  ({
    SMALL: 5,
    MED: 50,
    LARGE: 100,
    X_LARGE: 1000,
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
})

const initialState = {
  preventDefault: false,
  operations: [],
  newEntities: [],
  selection: {
    anchor: {
      index: 0,
      offset: 0,
    },
    focus: {
      index: 0,
      offset: 0,
    },
  },
  entityCache: {},
  blockCache: {},
  blocks: [],
  page: {
    _id: '5d6443bdd9ca9149d1a346c2',
    name: 'document',
    blocks: [],
  },
}

const generateBlock = (state, type) => {
  const _state = state

  const refId = ObjectId().toHexString()
  const _id = ObjectId().toHexString()

  _state.entityCache[refId] = {
    type,
    _id: refId,
    text: {
      textValue: ipsum.generateParagraphs(2),
      ranges: [],
    },
  }

  _state.blockCache[_id] = {
    type,
    entityId: refId,
  }

  _state.blocks.push({ _id })

  return _state
}

export const generateState = size => {
  const blockSize = getBlockSize(size)
  const types = ['ENTRY', 'SOURCE', 'TOPIC']
  let _state = cloneDeep(initialState)
  for (let i = 0; i < blockSize; i += 1) {
    const _type = types[Math.floor(Math.random() * types.length)]
    _state = generateBlock(_state, _type)
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
