import React from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
import createReducer from '@databyss-org/services/lib/createReducer'
import _ from 'lodash'
import reducer, { initialState } from './reducer'
import { saveTopic, fetchTopic, fetchTopicHeaders } from './actions'
import {
  TopicState,
  ResourceResponse,
  Topic,
  CacheDict,
  ResourcePending,
} from '../interfaces'

const useReducer = createReducer()

interface PropsType {
  children: JSX.Element
  initialState: TopicState
}

interface ContextType {
  state: TopicState
  getTopic: (id: string) => ResourceResponse<Topic>
  setTopic: (topic: Topic) => void
  getTopicHeaders: (id: string) => ResourceResponse<CacheDict<Topic>>
}

export const TopicContext = createContext<ContextType | null>(null)

const TopicProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState,
}: PropsType) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // provider methods
  const setTopic = (topic: Topic) => {
    if (_.isEqual(state.cache[topic._id], topic)) {
      return
    }
    // add or update topic and set cache value
    // add set timeout to prevent focus issue with line content editable on tab
    window.requestAnimationFrame(() => dispatch(saveTopic(topic)))
  }

  const getTopic = (id: string): ResourceResponse<Topic> => {
    if (state.cache[id]) {
      return state.cache[id]
    }
    dispatch(fetchTopic(id))
    return null
  }

  const getTopicHeaders = (): ResourceResponse<CacheDict<Topic>> => {
    if (state.headerCache) {
      return state.headerCache
    }

    if (!(state.headerCache instanceof ResourcePending)) {
      dispatch(fetchTopicHeaders())
    }

    return null
  }

  return (
    <TopicContext.Provider
      value={{
        state,
        setTopic,
        getTopic,
        getTopicHeaders,
      }}
    >
      {children}
    </TopicContext.Provider>
  )
}

export const useTopicContext = (selector = (x: any) => x) =>
  useContextSelector(TopicContext, selector)

TopicProvider.defaultProps = {
  initialState,
}

export default TopicProvider
