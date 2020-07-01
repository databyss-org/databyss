import { httpGet, httpPost } from '../lib/requestApi'
import { Topic } from '../interfaces'

export const getTopic = (_id: string): Promise<Topic> =>
  httpGet(`/topics/${_id}`)
export const getTopicHeaders = (): Promise<Topic[]> => httpGet(`/topics/`)
export const setTopic = (data: Topic) => httpPost('/topics', { data })
