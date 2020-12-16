import * as pouchDb from '../database/entries'

import { httpPost } from '../lib/requestApi'

export const searchEntries = (data) => httpPost('/entries/search/', { data })

export const setBlockRelations = (data) => pouchDb.setBlockRelations(data)

export const getBlockRelations = (queryId) => pouchDb.getBlockRelations(queryId)
