import * as app from './../actions/mocks'
import { appendBlock } from './../_helpers'

export const initialState = {
  contentRef: {},
  blocks: [],
  menu: {
    action: { type: '' },
    items: [{ type: '' }],
  },
  blockState: {
    html: '',
    rawText: 'enter text',
    source: { name: '' },
    type: '',
  },
  ...app,
}

export const initialState1 = {
  contentRef: {},
  blocks: [
    {
      html:
        'Stamenov, Maxim I., editor. Language Structure, Discourse and the Access to Consciousness. Vol. 12, John Benjamins Publishing Company 1997. Crossref, doi:10.1075/aicr.12.',
      rawText:
        'Stamenov, Maxim I., editor. Language Structure, Discourse and the Access to Consciousness. Vol. 12, John Benjamins Publishing Company 1997. Crossref, doi:10.1075/aicr.12.',
      source: { name: '' },
      type: 'RESOURCE',
    },
    {
      html: 'p 288-90',
      rawText: 'p 288-90',
      source: { name: '' },
      type: 'LOCATION',
    },
    {
      html: 'On the limitation of third-order thought to assertion',
      rawText: 'On the limitation of third-order thought to assertion',
      source: { name: '' },
      type: 'ENTRY',
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
      if (action.data.rawText.length === 0) {
        return {
          ...state,
          blockState: { ...action.data, html: '' },
        }
      } else if (action.data.html[0] === '@') {
        return {
          ...state,
          blockState: { ...action.data, type: 'RESOURCE' },
        }
      } else if (action.data.html[0] === '#') {
        return {
          ...state,
          blockState: { ...action.data, type: 'TAG' },
        }
      } else if (action.data.html.substring(0, 2) === '//') {
        return {
          ...state,
          blockState: { ...action.data, type: 'LOCATION' },
        }
      } else if (action.data.html.match('<div><br></div><div><br></div>')) {
        const newBlocks = appendBlock({
          blocks: state.blocks,
          newBlockInfo: action.data,
        })
        return {
          ...state,
          blockState: { ...action.data, html: '', type: 'NEW_ELEMENT' },
          blocks: newBlocks,
        }
      } else {
        return {
          ...state,
          blockState: { ...action.data, type: 'ENTRY' },
        }
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
    case 'NEW_LINE':
      if (
        state.blockState.type === 'RESOURCE' ||
        state.blockState.type === 'LOCATION' ||
        state.blockState.type === 'TAG'
      ) {
        const newBlocks = appendBlock({
          blocks: state.blocks,
          newBlockInfo: state.blockState,
        })
        return {
          ...state,
          blockState: { ...state.blockState, html: '', type: 'NEW_ELEMENT' },
          blocks: newBlocks,
        }
      } else {
        return {
          ...state,
          blockState: { ...state.blockState },
        }
      }

    default:
      return state
  }
}
