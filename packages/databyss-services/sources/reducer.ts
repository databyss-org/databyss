import produce, { Draft } from 'immer'
import {
  CACHE_SOURCE,
  SAVE_SOURCE,
  REMOVE_SOURCE,
  CACHE_SOURCES,
  CACHE_SEARCH_QUERY,
  FETCH_SEARCH_QUERY,
} from './constants'
import { FSA, SourceState } from '../interfaces'
import { ResourcePending } from '../interfaces/ResourcePending'

export const initialState: SourceState = {
  cache: {},
  searchCache: {},
}

// export default (state: SourceState, action: FSA) => {
//   switch (action.type) {
//     case CACHE_SOURCE: {
//       state.cache[action.payload.id] = action.payload.source
//       return state
//     }
//     case CACHE_SOURCES: {
//       const { sources } = action.payload
//       Object.keys(sources).forEach(s => {
//         state.cache[s] = sources[s]
//       })
//       return state
//     }
//     case SAVE_SOURCE: {
//       state.cache[action.payload.id] = action.payload.source
//       return state
//     }
//     case REMOVE_SOURCE: {
//       delete state.cache[action.payload.id]
//       return state
//     }
//     case FETCH_SEARCH_QUERY: {
//       const { query } = action.payload
//       state.cache[query] = new ResourcePending()
//       return state
//     }
//     case CACHE_SEARCH_QUERY: {
//       const { query } = action.payload
//       state.cache[query] = action.payload.results
//       return state
//     }
//     default:
//       return state
//   }
// }

// export default (state: SourceState, action: FSA): any =>
//   produce(state, (draft: Draft<SourceState>) => {
//     switch (action.type) {
//       case CACHE_SOURCE: {
//         draft.cache[action.payload.id] = action.payload.source
//         break
//       }
//       case CACHE_SOURCES: {
//         const { sources } = action.payload
//         Object.keys(sources).forEach(s => {
//           draft.cache[s] = sources[s]
//         })
//         break
//       }
//       case SAVE_SOURCE: {
//         draft.cache[action.payload.id] = action.payload.source
//         break
//       }
//       case REMOVE_SOURCE: {
//         delete draft.cache[action.payload.id]
//         break
//       }
//       case FETCH_SEARCH_QUERY: {
//         const { query } = action.payload
//         draft.cache[query] = new ResourcePending()
//         break
//       }
//       case CACHE_SEARCH_QUERY: {
//         const { query } = action.payload
//         draft.cache[query] = action.payload.results
//         break
//       }
//     }
//   })

export default produce((draft: Draft<SourceState>, action: FSA) => {
  switch (action.type) {
    case CACHE_SOURCE: {
      draft.cache[action.payload.id] = action.payload.source
      break
    }
    case CACHE_SOURCES: {
      const { sources } = action.payload
      Object.keys(sources).forEach(s => {
        draft.cache[s] = sources[s]
      })
      break
    }
    case SAVE_SOURCE: {
      draft.cache[action.payload.id] = action.payload.source
      break
    }
    case REMOVE_SOURCE: {
      delete draft.cache[action.payload.id]
      break
    }
    case FETCH_SEARCH_QUERY: {
      const { query } = action.payload
      draft.cache[query] = new ResourcePending()
      break
    }
    case CACHE_SEARCH_QUERY: {
      const { query } = action.payload
      draft.cache[query] = action.payload.results
      break
    }
  }
})
