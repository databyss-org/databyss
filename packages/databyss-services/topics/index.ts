import { httpGet, httpPost } from '../lib/requestApi'
import { Topic } from '../interfaces'
import { db } from '../database/db'
import setPouchTopic from '../database/setTopic'
import getPouchTopicHeaders from '../database/getTopics'

export const getTopic = (_id: string): Promise<Topic> => db.get(_id)

export const getTopicHeaders = () => getPouchTopicHeaders()

export const setTopic = (data: Topic) => setPouchTopic(data)
