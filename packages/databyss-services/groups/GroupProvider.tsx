import React, { useCallback, PropsWithChildren, useEffect } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
import createReducer from '@databyss-org/services/lib/createReducer'
import { groupHeaders } from '@databyss-org/ui/stories/Components/Sidebar/fixtures'
import {
  Group,
  ResourcePending,
  ResourceResponse,
  CacheDict,
  GroupState,
} from '../interfaces'
import reducer from './reducer'
import { fetchGroupHeaders, saveGroup } from './actions'

interface PropsType {
  initialState: GroupState
}

interface ContextType {
  state: GroupState
  getGroupHeaders: () => ResourceResponse<CacheDict<Group>>
  setGroup: (group: Group) => void
}

export const GroupContext = createContext<ContextType>(null!)
const useReducer = createReducer()

const GroupProvider = ({
  initialState = new GroupState(),
  children,
}: PropsWithChildren<PropsType>) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setGroup = useCallback(
    (group: Group) => {
      dispatch(saveGroup(group))
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

  useEffect(() => {
    console.log(groupHeaders)
    if (state.headerCache) {
      dispatch(fetchGroupHeaders())
    }
  }, [groupHeaders])

  return (
    <GroupContext.Provider
      value={{
        state,
        setGroup,
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
