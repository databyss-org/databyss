import { httpPost, httpGet } from '../lib/requestApi'

export const searchEntries = (data) => httpPost('/entries/search/', { data })

export const setBlockRelations = (data) =>
  httpPost('/entries/relations/', { data })

export const getBlockRelations = (queryId) =>
  httpGet(`/entries/relations/${queryId}`)
