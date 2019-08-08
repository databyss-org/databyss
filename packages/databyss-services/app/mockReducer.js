import * as app from '@databyss-org/services/app/mocks'

export const initialState1 = {
  blocks: [],
  menu: {
    action: { type: '' },
    items: [{ type: '' }],
  },
  blockState: {
    html: '',
    rawText: '',
    source: { name: '' },
    inSource: true,
  },
  ...app,
}

export const initialState = {
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
    rawText: 'enter text',
    source: { name: '' },
    type: '',
  },
  ...app,
}

export const reducer = (state, action) => {
  switch (action.type) {
    case 'ON_CHANGE':
      console.log('changed')
      return {
        ...state,
        blockState: action.data,
      }
    case 'NEW_SOURCE':
      let newBlockState = state.blockState
      newBlockState.type = 'source'
      console.log(newBlockState)
      console.log('source')
      return {
        ...state,
        blockState: newBlockState,
      }
    case 'NEW_LINE':
      console.log('line')
      console.log(action.data)
      return {
        ...state,
        blockState: action.data,
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
