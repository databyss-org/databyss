import { httpGet, httpPost } from '../lib/requestApi'
import { Topic } from '../interfaces'
import { db } from '../database/db'
import setPouchTopic from '../database/setTopic'
import getPouchTopicHeaders from '../database/getTopics'

export const getTopic = (_id: string): Promise<Topic> =>
  httpGet(`/topics/${_id}`)

// export const getTopicHeaders = (): Promise<Topic[]> => httpGet(`/topics/`)
export const getTopicHeaders = () => getPouchTopicHeaders()

// export const setTopic = (data: Topic) => httpPost('/topics', { data })
export const setTopic = (data: Topic) => setPouchTopic(data)

// db.upsert(data._id, (oldDoc) => ({ ...oldDoc, ...data, type: 'TOPIC' }))
