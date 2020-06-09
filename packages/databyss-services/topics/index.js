import { httpGet, httpPost } from '../lib/requestApi'

export const getTopic = _id => httpGet(`/topics/${_id}`)
export const getAllTopics = () => httpGet(`/topics/`)
export const setTopic = data => httpPost('/topics', { data })
