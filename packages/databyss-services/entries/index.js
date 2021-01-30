import * as pouchDb from '@databyss-org/data/pouchdb/entries'

export const searchEntries = (data) => pouchDb.searchEntries(data)

export const setBlockRelations = (data) => pouchDb.setBlockRelations(data)

export const getBlockRelations = (queryId) => pouchDb.getBlockRelations(queryId)
