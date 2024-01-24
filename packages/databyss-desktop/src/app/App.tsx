import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import SessionProvider from '@databyss-org/services/session/SessionProvider'
import { DatabaseProvider } from '@databyss-org/services/lib/DatabaseProvider'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'
import { queryClient } from '@databyss-org/services/lib/queryClient'
import { Viewport, useNavigationContext } from '@databyss-org/ui'
import { ContextMenuProvider } from '@databyss-org/ui/components/Menu/ContextMenuProvider'
import { Private } from './Private'
import { TitleBar } from '../components/TitleBar'

export const App = () => {
  const { location } = useNavigationContext()
  const urlParams = new URLSearchParams(location.search)
  // const [groupId, setGroupId] = useState<string | null>(null)

  return (
    <Viewport p={0}>
      <NotifyProvider>
        <QueryClientProvider client={queryClient}>
          <ContextMenuProvider>
            <DatabaseProvider noGroupHeader={<TitleBar bg="transparent" />}>
              <SessionProvider isLocalSession>
                <Private />
              </SessionProvider>
            </DatabaseProvider>
          </ContextMenuProvider>
        </QueryClientProvider>
      </NotifyProvider>
    </Viewport>
  )
}
