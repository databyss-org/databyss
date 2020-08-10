import { httpPost } from '../lib/requestApi'

export const searchEntries = data => httpPost('/entries/search/', { data })

export const setBlockRelations = data =>
  httpPost('/entries/relations/', { data })
