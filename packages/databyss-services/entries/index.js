import { httpPost } from '../lib/requestApi'

export const searchEntries = data => httpPost('/entries/search/', { data })
