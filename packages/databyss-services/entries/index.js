import * as pouchDb from '@databyss-org/data/pouchdb/entries'

export const searchEntries = (data, pages, blocks) =>
  pouchDb.searchEntries(data, Object.values(pages), blocks)

export const setBlockRelations = (relation) =>
  pouchDb.setBlockRelations(relation)
