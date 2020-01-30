import { httpGet, httpPost } from '../lib/requestApi'

export const getTopic = _id => httpGet(`/topics/${_id}`)

export const setTopic = data => httpPost('/topics', { data })
