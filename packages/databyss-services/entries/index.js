import setPouchBlockRelations from '@databyss-org/services/database/setBlockRelations'

import getPouchBlockRelations from '@databyss-org/services/database/getBlockRelations'

import { httpPost, httpGet } from '../lib/requestApi'

export const searchEntries = (data) => httpPost('/entries/search/', { data })

export const setBlockRelations = (data) => setPouchBlockRelations(data)
//  httpPost('/entries/relations/', { data })

export const getBlockRelations = (queryId) => getPouchBlockRelations(queryId)
//  httpGet(`/entries/relations/${queryId}`)
