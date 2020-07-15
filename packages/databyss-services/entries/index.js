import { httpPost } from '../lib/requestApi'

// export const searchEntries = string => httpGet(`/entries/search/${string}`)

export const searchEntries = data => httpPost('/entries/search/', { data })
