// import cloneDeep from 'clone-deep'

// import { SET_CONTENT } from './constants'

// export const initialState = {
//   textValue: null,
//   ranges: null,
//   editableState: null,
// }

// export const entities = (state, type) =>
//   ({
//     ENTRY: state.entries,
//     LOCATION: state.locations,
//     SOURCE: state.sources,
//     TOPIC: state.topics,
//   }[type])

// export const getRawHtmlForBlock = (state, block) =>
//   entities(state, block.type)[block.refId].rawHtml

// export const setRawHtmlForBlock = (state, block, html) => {
//   const nextState = cloneDeep(state)

//   switch (block.type) {
//     case 'ENTRY':
//       nextState.entries[block.refId].rawHtml = html
//       break
//     case 'SOURCE':
//       nextState.sources[block.refId].rawHtml = html
//       break
//     case 'LOCATION':
//       nextState.locations[block.refId].rawHtml = html
//       break
//     case 'TOPIC':
//       nextState.topics[block.refId].rawHtml = html
//       break
//     default:
//       throw new Error('Invalid block type', block.type)
//   }
//   return nextState
// }

// export const getBlockRefEntity = (state, block) =>
//   entities(state, block.type)[block.refId]

// export const correctRangeOffsetForBlock = (state, block, offset) => {
//   const _state = cloneDeep(state)
//   getBlockRefEntity(_state, block).ranges = getBlockRefEntity(
//     _state,
//     block
//   ).ranges.map(r => ({ ...r, offset: r.offset + offset }))
//   return _state
// }

// export const getRangesForBlock = (state, block) => {
//   switch (block.type) {
//     case 'ENTRY':
//       return state.entries[block.refId].ranges
//     case 'SOURCE':
//       return state.sources[block.refId].ranges
//     case 'LOCATION':
//       return state.locations[block.refId].ranges
//     case 'TOPIC':
//       return state.topics[block.refId].ranges
//     default:
//       throw new Error('Invalid block type', block.type)
//   }
// }

// export const setRangesForBlock = (state, block, ranges) => {
//   const nextState = cloneDeep(state)
//   entities(nextState, block.type)[block.refId].ranges = ranges
//   return nextState
// }

// const getMarkupValues = (nextState, ranges) => {
//   const block = nextState.blocks[nextState.activeBlockId]
//   const _state = cloneDeep(nextState)
//   switch (block.type) {
//     case 'ENTRY':
//       _state.entries[block.refId] = {
//         ..._state.entries[block.refId],
//         ranges,
//       }
//       break
//     case 'SOURCE':
//       _state.entries[block.refId] = {
//         ..._state.sources[block.refId],
//         ranges,
//       }
//       break
//     case 'TOPIC':
//       _state.entries[block.refId] = {
//         ..._state.topics[block.refId],
//         ranges,
//       }
//       break
//     default:
//       break
//   }

//   return _state
// }

// export default (state, action) => {
//   switch (action.type) {
//     // this one
//     case SET_ACTIVE_BLOCK_ID:
//       return {
//         ...state,
//         activeBlockId: action.payload.id,
//       }
//     // this one
//     case SET_ACTIVE_BLOCK_CONTENT: {
//       const activeBlock = state.blocks[state.activeBlockId]

//       let nextState = setRawHtmlForBlock(
//         state,
//         activeBlock,
//         action.payload.html
//       )
//       if (action.payload.ranges) {
//         nextState = getMarkupValues(nextState, action.payload.ranges)
//       }
//       return nextState
//     }

//     default:
//       return state
//   }
// }
