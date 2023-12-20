import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import SessionProvider from '@databyss-org/services/session/SessionProvider'
import { DatabaseProvider } from '@databyss-org/services/lib/DatabaseProvder'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'
import { queryClient } from '@databyss-org/services/lib/queryClient'
import { Viewport, useNavigationContext } from '@databyss-org/ui'
import { Private } from './Private'

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
