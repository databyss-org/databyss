import * as pouchDb from '@databyss-org/data/pouchdb/entries'

export const searchEntries = (data, pages) => pouchDb.searchEntries(data, pages)

export const setBlockRelations = (relation) =>
  pouchDb.setBlockRelations(relation)
