import * as pouchDb from '@databyss-org/data/pouchdb/entries'
// import { debounce } from 'lodash'
// import { optimizeBlockRelations } from './util'

// const THROTTLE_BLOCK_RELATIONS = 100

export const searchEntries = (data) => pouchDb.searchEntries(data)

// export const setBlockRelations = (data) => pouchDb.setBlockRelations(data)

export const getBlockRelations = (queryId) => pouchDb.getBlockRelations(queryId)

export const setBlockRelations = (relation) =>
  pouchDb.setBlockRelations(relation)

// let blockRelationsQ = []

// const throttleBlockRelations = debounce((callback) => {
//   if (blockRelationsQ.length) {
//     const _blockRelations = optimizeBlockRelations(blockRelationsQ)
//     pouchDb.setBlockRelations(_blockRelations).then(callback)
//     blockRelationsQ = []
//   }
// }, THROTTLE_BLOCK_RELATIONS)

// async function could receive a callback function
// export const setBlockRelations = (blockRelations) =>
//   console.log('BLOCK RELATIONS SHOULD BE SET')

// new Promise((res) => {
//   console.log('BLOCK RELATIONS SHOULD BE SET')
// if callback is provided, this function will wait till throttle is complete before executing callback function
// if (
//   blockRelations?.blocksRelationArray?.length ||
//   blockRelations.clearPageRelationships
// ) {
//   blockRelationsQ.push(blockRelations)
//   // pass the callback to the throttle function
//   throttleBlockRelations(res)
// }
// })
