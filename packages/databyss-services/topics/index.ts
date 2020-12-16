import { Topic } from '../interfaces'
import * as pouchDB from '../database/topics'

export const getTopic = (_id: string): Promise<Topic> => pouchDB.getTopic(_id)

export const getTopicHeaders = () => pouchDB.getTopicHeaders()

export const setTopic = (data: Topic) => pouchDB.setTopic(data)
