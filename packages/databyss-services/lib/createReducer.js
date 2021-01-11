import { useRef, useCallback, useState, useEffect } from 'react'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'

function composeMiddleware(chain) {
  return (context, dispatch) =>
    chain.reduceRight((res, middleware) => middleware(context)(res), dispatch)
}

const createReducer = (...middlewares) => {
  const logger = createLogger({
    collapsed: true,
  })
  const composedMiddleware = composeMiddleware([
    thunk,
    ...middlewares,
    ...(process.env.NODE_ENV === 'development' ? [logger] : []),
  ])

  return (reducer, initialState, { initializer, name, onChange } = {}) => {
    // initialState must be a plain JSON object
    const _initialState = Object.assign({}, initialState)
    const ref = useRef((initializer || ((value) => value))(_initialState))
    const [, setState] = useState(ref.current)

    const dispatch = useCallback(
      (action) => {
        action.meta = { provider: name }
        ref.current = reducer(ref.current, action, onChange)
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

    useEffect(() => {
      dispatchRef.current = composedMiddleware(
        {
          getState: () => ref.current,
          dispatch: (...args) => dispatchRef.current(...args),
        },
        dispatch
      )
    }, [dispatch])

    return [ref.current, dispatchRef.current, ref]
  }
}

export default createReducer
