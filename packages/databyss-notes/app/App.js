import React from 'react'
import { Base64 } from 'js-base64'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SessionProvider from '@databyss-org/services/session/SessionProvider'
import { DatabaseProvider } from '@databyss-org/services/lib/DatabaseProvider'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'
import { Viewport, useNavigationContext } from '@databyss-org/ui'
import FirefoxWarning from '@databyss-org/ui/components/Notify/FirefoxWarning'
import Public from './Public'
import Private from './Private'
import { ContextMenuProvider } from '@databyss-org/ui/components/Menu/ContextMenuProvider'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable window focus refetching globally for all react-query hooks
      // see: https://react-query.tanstack.com/guides/window-focus-refetching
      refetchOnWindowFocus: false,
      // Never set queries as stale
      staleTime: Infinity,
      cacheTime: Infinity,
      networkMode: 'always',
    },
  },
})

const App = () => {
  const { location } = useNavigationContext()
  const urlParams = new URLSearchParams(location.search)
  let email
  let code
  try {
    ;[email, code] = JSON.parse(Base64.decode(urlParams.get('auth')))
    // eslint-disable-next-line no-empty
  } catch (e) {}
  return (
    <Viewport p={0}>
      <NotifyProvider>
        <FirefoxWarning />
        {process.env.MAINTENANCE_MODE?.toLowerCase() === 'true' ? (
          <Public />
        ) : (
          <QueryClientProvider client={queryClient}>
            <ContextMenuProvider>
              <DatabaseProvider isPublished>
                <SessionProvider isLocalSession>
                  <Private />
                </SessionProvider>
              </DatabaseProvider>
            </ContextMenuProvider>
          </QueryClientProvider>
        )}
      </NotifyProvider>
    </Viewport>
  )
}

export default App
