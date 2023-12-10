import React, { useState } from 'react'
import { Base64 } from 'js-base64'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SessionProvider from '@databyss-org/services/session/SessionProvider'
import { DatabaseProvider } from '@databyss-org/services/lib/DatabaseProvder'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'
import { Viewport, useNavigationContext } from '@databyss-org/ui'
import { Private } from './Private'

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

export const App = () => {
  const { location } = useNavigationContext()
  const urlParams = new URLSearchParams(location.search)
  // const [groupId, setGroupId] = useState<string | null>(null)

  return (
    <Viewport p={0}>
      <NotifyProvider>
        <QueryClientProvider client={queryClient}>
          <DatabaseProvider>
            <SessionProvider isLocalSession>
              <Private />
            </SessionProvider>
          </DatabaseProvider>
        </QueryClientProvider>
      </NotifyProvider>
    </Viewport>
  )
}
