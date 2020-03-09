import React, { createContext, useContext } from 'react'
import createReducer from '../lib/createReducer'
import reducer, { initialState } from './reducer'
import { ResourcePending } from '../lib/ResourcePending'
import Page from './Page'

import { fetchPageHeaders, fetchPage, savePage } from './actions'

interface PropsType {
  children: JSX.Element
  initialState: any
}

interface ContextType {
  setPage: (page: Page) => void
  getPages: () => void
  getPage: (id: string) => Page | ResourcePending | null
}

const useReducer = createReducer()
export const PageContext = createContext<ContextType | null>(null)

const PageProvider: React.FunctionComponent<PropsType> = ({
  children,
  initialState,
}: PropsType) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setPage = (page: Page): void => {
    // window.requestAnimationFrame(() => dispatch(savePage(page)))
    dispatch(savePage(page))
  }

  const getPages = () => {
    if (state.headerCache) {
      return state.headerCache
    }

    if (!(state.headerCache instanceof ResourcePending)) {
      dispatch(fetchPageHeaders())
    }

    return null
  }

  const getPage = (id: string): Page | ResourcePending | null => {
    if (state.cache[id]) {
      return state.cache[id]
    }
    if (!(state.cache[id] instanceof ResourcePending)) {
      dispatch(fetchPage(id))
    }
    return null
  }

  return (
    <PageContext.Provider value={{ getPages, getPage, setPage }}>
      {children}
    </PageContext.Provider>
  )
}

export const usePageContext = () => useContext(PageContext)

PageProvider.defaultProps = {
  initialState,
}

// interface PropsLoaderType {
//   children: JSX.Element
//   sourceId: string
// }

// export const PagesLoader: React.FunctionComponent<PropsLoaderType> = ({
//   children,
//   sourceId,
// }: PropsLoaderType) => {
//   const { getPages } = usePageContext()
//   const source = getPages(getPages)

//   if (source instanceof Error) {
//     return <ErrorFallback error={source} />
//   }
//   // const child = React.Children.only(children)
//   if (typeof children !== 'function') {
//     throw new Error('Child must be a function')
//   }
//   return source ? children(source) : <Loading />
// }

// export const withSource = Wrapped => ({ sourceId, ...others }) => (
//   <PagesLoader sourceId={sourceId}>
//     {source => <Wrapped source={source} {...others} />}
//   </PagesLoader>
// )

export default PageProvider
