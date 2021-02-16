import * as pouchDb from '@databyss-org/data/pouchdb/entries'

export const searchEntries = (data) => pouchDb.searchEntries(data)

export const setBlockRelations = (relation) =>
  pouchDb.setBlockRelations(relation)
