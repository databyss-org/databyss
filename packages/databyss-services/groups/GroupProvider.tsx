import React, { useCallback, PropsWithChildren } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
import createReducer from '@databyss-org/services/lib/createReducer'
import {
  Group,
  ResourcePending,
  ResourceResponse,
  CacheDict,
  GroupState,
} from '../interfaces'
import reducer from './reducer'
import { fetchGroupHeaders } from './actions'

interface PropsType {
  initialState: GroupState
}

interface ContextType {
  state: GroupState
  getGroupHeaders: () => ResourceResponse<CacheDict<Group>>
}

export const GroupContext = createContext<ContextType>(null!)
const useReducer = createReducer()

const GroupProvider = ({
  initialState = new GroupState(),
  children,
}: PropsWithChildren<PropsType>) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const getGroupHeaders = useCallback(() => {
    if (state.headerCache) {
      return state.headerCache
    }

    if (!(state.headerCache instanceof ResourcePending)) {
      dispatch(fetchGroupHeaders())
    }

    return null
  }, [state.headerCache])

  return (
    <GroupContext.Provider
      value={{
        state,
        getGroupHeaders,
      }}
    >
      {children}
    </GroupContext.Provider>
  )
}

export const useGroupContext = (selector = (x: ContextType) => x) =>
  useContextSelector(GroupContext, selector)

export default GroupProvider
