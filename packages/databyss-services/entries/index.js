import * as pouchDb from '@databyss-org/data/pouchdb/entries'

export const searchEntries = (data, pages) =>
  pouchDb.searchEntries(data, Object.values(pages))
