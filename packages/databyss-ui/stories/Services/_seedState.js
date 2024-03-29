import { uid } from '@databyss-org/data/lib/uid'

const sourceId = uid()
const entryId = uid()
const blockOneId = uid()
const blockTwoId = uid()

export default (pageId) => ({
  editableState: null,
  activeBlockId: null,
  newSources: [],
  newTopics: [],
  topics: {},
  locations: {},
  sources: {
    [sourceId]: {
      _id: sourceId,
      textValue:
        'Stamenov, Language Structure, Discourse and the Access to Consciousness',
    },
  },
  entries: {
    [entryId]: {
      _id: entryId,
      textValue: 'On the limitation of third-order thought to assertion',
    },
  },
  blocks: {
    [blockOneId]: {
      type: 'SOURCE',
      _id: blockOneId,
      refId: sourceId,
    },
    [blockTwoId]: {
      type: 'ENTRY',
      _id: blockTwoId,
      refId: entryId,
    },
  },
  page: {
    _id: pageId,
    name: 'test document',
    blocks: [
      {
        _id: blockOneId,
      },
      {
        _id: blockTwoId,
      },
    ],
  },
})
