import * as services from './'

import {
  FETCH_TOPIC,
  CACHE_TOPIC,
  FETCH_TOPIC_HEADERS,
  CACHE_TOPIC_HEADERS,
  REMOVE_PAGE_FROM_HEADER,
  ADD_PAGE_TO_HEADER,
} from './constants'
import { Topic } from '../interfaces'

export function fetchTopic(id: string) {
  return async (dispatch: Function) => {
    dispatch({
      type: FETCH_TOPIC,
      payload: { id },
    })
    try {
      const topic = await services.getTopic(id)
      dispatch({
        type: CACHE_TOPIC,
        payload: { topic, id },
      })
    } catch (err) {
      dispatch({
        type: CACHE_TOPIC,
        payload: {
          topic: err,
          id,
        },
      })
    }
  }
}

export function saveTopic(topic: Topic) {
  return async (dispatch: Function) => {
    dispatch({
      type: CACHE_TOPIC,
      payload: { topic, id: topic._id },
    })
    services.setTopic(topic).then(() => {
      // reset page headers
      dispatch(fetchTopicHeaders())
    })
    // TODO: set error handler if failed save
  }
}

export function fetchTopicHeaders() {
  return async (dispatch: Function) => {
    dispatch({
      type: FETCH_TOPIC_HEADERS,
    })
    try {
      const topics = await services.getTopicHeaders()
      dispatch({
        type: CACHE_TOPIC_HEADERS,
        payload: { topics },
      })
    } catch (err) {
      dispatch({
        type: CACHE_TOPIC_HEADERS,
        payload: { topics: err },
      })
    }
  }
}

export function removePageFromHeaders(id: string, pageId: string) {
  return (dispatch: Function) => {
    dispatch({
      type: REMOVE_PAGE_FROM_HEADER,
      payload: { id, pageId },
    })
  }
}

export function addPageToHeaders(id: string, pageId: string) {
  return (dispatch: Function) => {
    dispatch({
      type: ADD_PAGE_TO_HEADER,
      payload: { id, pageId },
    })
  }
}
