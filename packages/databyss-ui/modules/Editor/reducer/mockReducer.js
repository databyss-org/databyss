import * as app from './../actions/mocks'
import { appendBlock } from './../_helpers'

export const initialState1 = {
  blocks: [],
  menu: {
    action: { type: '' },
    items: [{ type: '' }],
  },
  blockState: {
    html: '',
    rawText: 'enter text',
    source: { name: '' },
    inSource: true,
  },
  ...app,
}

export const initialState = {
  contentRef: {},
  blocks: [
    {
      type: 'RESOURCE',
      data:
        'Stamenov, Maxim I., editor. Language Structure, Discourse and the Access to Consciousness. Vol. 12, John Benjamins Publishing Company 1997. Crossref, doi:10.1075/aicr.12.',
    },
    {
      type: 'LOCATION',
      data: 'p 288-90',
    },
    {
      type: 'ENTRY',
      data: 'On the limitation of third-order thought to assertion',
    },
  ],
  menu: {
    action: { type: 'NEW_ENTRY' },
    items: [
      { type: 'CLOSE' },
      { type: 'NEW_SOURCE' },
      { type: 'NEW_LOCATION' },
    ],
  },
  blockState: {
    html: '',
    rawText: '',
    source: { name: '' },
    type: '',
  },
  ...app,
}

export const reducer = (state, action) => {
  console.log(action.type)

  switch (action.type) {
    case 'ON_CHANGE':
      if (action.data.html[0] === '@') {
        return {
          ...state,
          blockState: { ...action.data, html: '', type: 'RESOURCE' },
        }
      } else {
        return {
          ...state,
          blockState: action.data,
        }
      }

    case 'IN_SOURCE':
      return {
        ...state,
        blockState: { ...state.blockState, html: '', type: 'RESOURCE' },
      }
    case 'BACKSPACE':
      if (state.blockState.html.length === 0) {
        return {
          ...state,
          blockState: { ...state.blockState, type: 'NEW' },
        }
      } else {
        return {
          ...state,
        }
      }
    case 'SET_REF':
      return {
        ...state,
        contentRef: action.data,
      }
    case 'SET_FOCUS':
      return {
        ...state,
        blockState: { ...state.blockState, type: 'NEW' },
      }

    case 'NEW_SOURCE':
      const newBlockState =
        state.blockState.type !== 'RESOURCE'
          ? { ...state.blockState, type: 'RESOURCE' }
          : { ...state.blockState }
      return {
        ...state,
        blockState: newBlockState,
      }
    case 'NEW_LINE':
      if (state.blockState.type === 'RESOURCE') {
        const newBlocks = appendBlock({
          blocks: state.blocks,
          newBlockInfo: state.blockState,
        })
        return {
          ...state,
          blockState: { ...state.blockState, html: '', type: 'NEW_ELEMENT' },
          blocks: newBlocks,
        }
      }
      return {
        ...state,
        blockState: { ...state.blockState, type: 'NEW' },
      }

    case 'FIRE':
      // manipulate here
      return {
        ...state,
      }
    default:
      return state
  }
}
