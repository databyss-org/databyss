import { useRef, useCallback, useState, useEffect } from 'react'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'

function composeMiddleware(chain) {
  return (context, dispatch) =>
    chain.reduceRight((res, middleware) => middleware(context)(res), dispatch)
}

const logger = createLogger({
  collapsed: true,
})

const createReducer = (...middlewares) => {
  const composedMiddleware = composeMiddleware([
    thunk,
    ...middlewares,
    ...(process.env.NODE_ENV === 'development' ? [logger] : []),
  ])

  return (reducer, initialState, initializer = value => value) => {
    const ref = useRef(initializer(initialState))
    const [, setState] = useState(ref.current)

    const dispatch = useCallback(
      action => {
        ref.current = reducer(ref.current, action)
        Object.freeze(ref.current)
        setState(ref.current)
        return action
      },
      [reducer]
    )

    const dispatchRef = useRef(
      composedMiddleware(
        {
          getState: () => ref.current,
          dispatch: (...args) => dispatchRef.current(...args),
        },
        dispatch
      )
    )

    useEffect(
      () => {
        dispatchRef.current = composedMiddleware(
          {
            getState: () => ref.current,
            dispatch: (...args) => dispatchRef.current(...args),
          },
          dispatch
        )
      },
      [dispatch]
    )

    return [ref.current, dispatchRef.current, ref]
  }
}

export default createReducer
