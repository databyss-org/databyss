import * as topics from './'

import { FETCH_TOPIC, SAVE_TOPIC, CACHE_TOPIC } from './constants'

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
    topics.setTopic(topicFields).then(() => {
      dispatch({
        type: CACHE_TOPIC,
        payload: { topic: topicFields, id: topicFields._id },
      })
    })
  }
}
