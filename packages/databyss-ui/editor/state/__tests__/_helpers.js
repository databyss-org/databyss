import { LoremIpsum } from 'lorem-ipsum'
import ObjectId from 'bson-objectid'
import cloneDeep from 'clone-deep'

export const SMALL = 'SMALL'
export const MED = 'MED'
export const LARGE = 'LARGE'

export const getBlockSize = size =>
  ({
    SMALL: 5,
    MED: 50,
    LARGE: 500,
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
  sources: {},
  entries: {},
  topics: {},
  blocks: {},
  page: {
    _id: '5d6443bdd9ca9149d1a346c2',
    name: 'document',
    blocks: [],
  },
}

const generateBlock = (state, type) => {
  const _state = state
  const _entities = { SOURCE: 'sources', ENTRY: 'entries', TOPIC: 'topics' }[
    type
  ]
  const refId = ObjectId().toHexString()
  const _id = ObjectId().toHexString()

  _state[_entities][refId] = {
    _id: refId,
    textValue: ipsum.generateParagraphs(2),
    ranges: [],
  }

  _state.blocks[_id] = {
    type,
    _id,
    refId,
  }

  _state.page.blocks.push({ _id })

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
