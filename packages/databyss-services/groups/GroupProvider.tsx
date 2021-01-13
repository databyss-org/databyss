import React, { useCallback, PropsWithChildren, useState } from 'react'
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
import {
  fetchGroupHeaders,
  fetchSharedPageHeaders,
  saveGroup,
  fetchGroup,
} from './actions'
import * as services from './services'

interface PropsType {
  initialState: GroupState
}

interface ContextType {
  state: GroupState
  getGroupHeaders: () => ResourceResponse<CacheDict<Group>>
  getSharedPageHeaders: () => ResourceResponse<CacheDict<Group>>
  setGroup: (id: string, cb: (oldGroup: Group) => Group) => void
  getGroup: (id: string) => Group
}

export const GroupContext = createContext<ContextType>(null!)
const useReducer = createReducer()

const GroupProvider = ({
  initialState = new GroupState(),
  children,
}: PropsWithChildren<PropsType>) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setGroup = useCallback(
    async (id: string, cb: (oldGroup: Group) => Group) => {
      const _oldGroup = Object.assign({}, await services.getGroup(id))
      dispatch(saveGroup(cb(_oldGroup)))
    },
    [state]
  )

  const getGroup = useCallback(
    (id: string) => {
      if (state.cache[id]) {
        return state.cache[id]
      }
      if (!(state.cache[id] instanceof ResourcePending)) {
        dispatch(fetchGroup(id))
      }
      return null
    },
    [state]
  )

  const getGroupHeaders = useCallback(() => {
    if (state.headerCache) {
      return state.headerCache
    }
    if (!(state.headerCache instanceof ResourcePending)) {
      dispatch(fetchGroupHeaders())
    }
    return null
  }, [state.headerCache])

  const getSharedPageHeaders = useCallback(() => {
    if (state.sharedPageHeaderCache) {
      return state.sharedPageHeaderCache
    }
    if (!(state.sharedPageHeaderCache instanceof ResourcePending)) {
      dispatch(fetchSharedPageHeaders())
    }
    return null
  }, [state.sharedPageHeaderCache])

  return (
    <GroupContext.Provider
      value={{
        state,
        setGroup,
        getGroup,
        getGroupHeaders,
        getSharedPageHeaders,
      }}
    >
      {children}
    </GroupContext.Provider>
  )
}

export const useGroupContext = (selector = (x: ContextType) => x) =>
  useContextSelector(GroupContext, selector)

export default GroupProvider
