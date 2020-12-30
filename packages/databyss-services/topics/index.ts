import { Topic } from '../interfaces'
import * as pouchDB from '../database/topics'
import { ResourceNotFoundError } from '../interfaces/Errors'

export const getTopic = (_id: string): Promise<Topic | ResourceNotFoundError> =>
  pouchDB.getTopic(_id)

export const getTopicHeaders = () => pouchDB.getTopicHeaders()

export const setTopic = (data: Topic) => pouchDB.setTopic(data)
