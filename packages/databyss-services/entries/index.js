import * as pouchDb from '@databyss-org/data/pouchdb/entries'

export const searchEntries = (data) => pouchDb.searchEntries(data)

export const getBlockRelations = (queryId) => pouchDb.getBlockRelations(queryId)

export const setBlockRelations = (relation) =>
  pouchDb.setBlockRelations(relation)
