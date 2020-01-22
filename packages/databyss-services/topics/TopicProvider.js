import React, { createContext, useContext } from 'react'
import ErrorFallback from '@databyss-org/ui/components/Notify/ErrorFallback'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import createReducer from '@databyss-org/services/lib/createReducer'
import _ from 'lodash'

import reducer, { initialState } from './reducer'

import { saveTopic, fetchTopic } from './actions'

const useReducer = createReducer()

export const TopicContext = createContext()

const TopicProvider = ({ children, initialState, reducer }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // provider methods
  const setTopic = topic => {
    if (_.isEqual(state.cache[topic._id], topic)) {
      return
    }
    // add or update topic and set cache value
    // add set timeout to prevent focus issue with line content editable on tab
    window.requestAnimationFrame(() => dispatch(saveTopic(topic)))
  }

  const getTopic = id => {
    console.log('getting topic')
    if (state.cache[id]) {
      return state.cache[id]
    }
    dispatch(fetchTopic(id))
    return null
  }

  return (
    <TopicContext.Provider
      value={{
        state,
        setTopic,
        getTopic,
      }}
    >
      {children}
    </TopicContext.Provider>
  )
}

export const useTopicContext = () => useContext(TopicContext)

TopicProvider.defaultProps = {
  initialState,
  reducer,
}

export const TopicLoader = ({ topicId, children }) => {
  const { getTopic } = useTopicContext()
  const topic = getTopic(topicId)

  if (topic instanceof Error) {
    return <ErrorFallback error={topic} />
  }

  // const child = React.Children.only(children)
  if (typeof children !== 'function') {
    throw new Error('Child must be a function')
  }
  return topic ? children(topic) : <Loading />
}

export const withTopic = Wrapped => ({ topicId, ...others }) => (
  <TopicLoader topicId={topicId}>
    {topic => <Wrapped topic={topic} {...others} />}
  </TopicLoader>
)

export default TopicProvider
