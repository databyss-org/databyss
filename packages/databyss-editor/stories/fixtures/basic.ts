import { BlockType } from '@databyss-org/services/interfaces'
import { EditorState } from '../../interfaces'
import { RangeType } from '../../../databyss-services/interfaces/Range'

const _source1 = {
  type: BlockType.Source,
  _id: '5e3b2000fda293001813b1d6',
  text: {
    textValue:
      'Stamenov, Language Structure, Discourse and the Access to Consciousness',
    ranges: [{ offset: 0, length: 8, marks: [RangeType.Bold] }],
  },
}

const basicFixture: EditorState = {
  preventDefault: false,
  operations: [],
  selection: {
    _id: '5e3f829ce5447c0018baebed',
    anchor: {
      index: 0,
      offset: 0,
    },
    focus: {
      index: 0,
      offset: 0,
    },
  },
  newEntities: [],
  changedEntities: [],
  entitySuggestionCache: {},
  removedEntities: [],
  blocks: [
    _source1,
    {
      type: 'ENTRY' as BlockType,
      _id: '5e3f829ce5447c0018baebed',
      text: {
        textValue: `On the limitation of \nthird-order thought to assertion`,
        ranges: [
          {
            offset: 7,
            length: 10,
            marks: [RangeType.Bold],
          },
          {
            offset: 7,
            length: 10,
            marks: [RangeType.Italic],
          },
        ],
      },
    },
    {
      type: 'ENTRY' as BlockType,
      _id: '5e482019a22c0a42ee20a748',
      text: {
        textValue: 'Another entry',
        ranges: [],
      },
    },
    {
      type: 'ENTRY' as BlockType,
      _id: '5e3f829ce5447c0018baebee',
      text: {
        textValue: '',
        ranges: [],
      },
    },
    {
      type: 'TOPIC' as BlockType,
      _id: '5e3b1bc48fb28680fe26437d',
      text: {
        textValue: 'Some topic',
        ranges: [],
      },
    },
    _source1,
  ],
}

export default basicFixture
