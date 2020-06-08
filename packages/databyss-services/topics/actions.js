import * as topics from './'

import {
  FETCH_TOPIC,
  SAVE_TOPIC,
  CACHE_TOPIC,
  GET_ALL_TOPICS,
  CLEAR_TOPICS,
} from './constants'

export function fetchTopic(id) {
  return async dispatch => {
    dispatch({
      type: FETCH_TOPIC,
      payload: {},
    })

    topics
      .getTopic(id)
      .then(topic => {
        dispatch({
          type: CACHE_TOPIC,
          payload: { topic, id },
        })
      })
      .catch(err => {
        dispatch({
          type: CACHE_TOPIC,
          payload: {
            topic: err,
            id,
          },
        })
      })
  }
}

export function saveTopic(topicFields) {
  return async dispatch => {
    dispatch({
      type: SAVE_TOPIC,
      payload: { topic: topicFields, id: topicFields._id },
    })
    topics.setTopic(topicFields)
    // TODO: set error handler if failed save
  }
}

export function getAllTopicsFromAPI() {
  return async dispatch => {
    dispatch({
      type: CLEAR_TOPICS,
    })
    topics.getAllTopics().then(topics => {
      dispatch({
        type: GET_ALL_TOPICS,
        payload: { topics },
      })
    })

    // TODO: set error handler if failed save
  }
}
