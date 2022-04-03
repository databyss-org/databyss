import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useNavigationContext } from '@databyss-org/ui'
import ServiceProvider from '@databyss-org/services/lib/ServiceProvider'
import SessionProvider from '@databyss-org/services/session/SessionProvider'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'
import Public from '@databyss-org/notes/app/Public'

import Private from '../modules/Private'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable window focus refetching globally for all react-query hooks
      // see: https://react-query.tanstack.com/guides/window-focus-refetching
      refetchOnWindowFocus: false,
      // Never set queries as stale
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  },
})

// component
const App = () => {
  const { location } = useNavigationContext()
  const urlParams = new URLSearchParams(location.search)

  const isSignUp = () => location.pathname === '/signup'

  // render methods
  const render = () => (
    <NotifyProvider>
      <ServiceProvider>
        <QueryClientProvider client={queryClient}>
          <SessionProvider
            signUp={isSignUp()}
            code={urlParams.get('code')}
            unauthorizedChildren={<Public signupFlow={isSignUp()} />}
          >
            <Private />
          </SessionProvider>
        </QueryClientProvider>
      </ServiceProvider>
    </NotifyProvider>
  )

  return render()
}

export default App
