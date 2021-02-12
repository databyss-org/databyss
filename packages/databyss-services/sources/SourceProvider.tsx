import _ from 'lodash'
import { createContext, useContextSelector } from 'use-context-selector'
import React, { useCallback } from 'react'
import createReducer from '@databyss-org/services/lib/createReducer'

import { SourceState } from '../interfaces'

import { SET_PREFERRED_CITATION_STYLE } from './constants'
import reducer, { initialState as _initState } from './reducer'

interface PropsType {
  children: JSX.Element
  initialState?: SourceState
}

interface ContextType {
  state: SourceState
  setPreferredCitationStyle: (styleId: string) => void
  getPreferredCitationStyle: () => void
}

const useReducer = createReducer()
export const SourceContext = createContext<ContextType>(null!)

const SourceProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState = _initState,
}: PropsType) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // TODO: move to userPreferences and replace with hooks
  const setPreferredCitationStyle = useCallback(
    (styleId: string) => {
      // error checks
      const typeOfStyleId = typeof styleId
      if (typeOfStyleId !== 'string') {
        throw new Error(
          `setPreferredCitationStyle() expected 'styleId' to be a string.
          Received "${typeOfStyleId}".`
        )
      }
      // dispatch
      dispatch({ type: SET_PREFERRED_CITATION_STYLE, payload: { styleId } })
    },
    [dispatch]
  )

  const getPreferredCitationStyle = () => state.preferredCitationStyle

  return (
    <SourceContext.Provider
      value={{
        state,
        setPreferredCitationStyle,
        getPreferredCitationStyle,
      }}
    >
      {children}
    </SourceContext.Provider>
  )
}

export const useSourceContext = (selector = (x: ContextType) => x) =>
  useContextSelector(SourceContext, selector)

export default SourceProvider
