import { httpGet, httpPost } from '../lib/requestApi'

export const searchEntries = string => httpGet(`/entries/search/${string}`)
