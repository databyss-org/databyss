import * as pouchDb from '@databyss-org/data/pouchdb/entries'
// import { debounce } from 'lodash'
// import { optimizeBlockRelations } from './util'

// const THROTTLE_BLOCK_RELATIONS = 100

export const searchEntries = (data) => pouchDb.searchEntries(data)

// export const setBlockRelations = (data) => pouchDb.setBlockRelations(data)

export const getBlockRelations = (queryId) => pouchDb.getBlockRelations(queryId)

export const setBlockRelations = (relation) =>
  pouchDb.setBlockRelations(relation)
