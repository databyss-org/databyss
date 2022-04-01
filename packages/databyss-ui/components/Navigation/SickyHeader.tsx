/* eslint-disable react/no-danger */
import React, { ReactNode, PropsWithChildren } from 'react'
import { useDebounce } from 'use-debounce'
import { Helmet } from 'react-helmet'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { View, Text } from '@databyss-org/ui/primitives'
import { isMobile } from '@databyss-org/ui/lib/mediaQuery'
import { AccountMenu } from '@databyss-org/ui/components'

interface StickyHeaderProps {
  path: string[]
  contextMenu?: ReactNode
}

export const StickyHeader = ({
  path,
  contextMenu,
  children,
}: PropsWithChildren<StickyHeaderProps>) => {
  const { isOnline } = useNotifyContext()
  const isDbBusy = useSessionContext((c) => c && c.isDbBusy)
  const readsPending = useSessionContext((c) => c && c.readsPending)
  const writesPending = useSessionContext((c) => c && c.writesPending)

  const [debouncedIsOnline] = useDebounce(isOnline, 1000, { trailing: true })
  const [debouncedIsDbBusy] = useDebounce(isDbBusy, 1000, { trailing: true })

  if (isMobile()) {
    return null
  }

  let statusMessage =
    'Databyss is up to date.\nAll your changes have been synched to the cloud.'
  if (!debouncedIsOnline) {
    statusMessage =
      'Databyss is offline.\nYour changes are being saved locally and will be synched when you go back online.'
  } else if (debouncedIsDbBusy) {
    statusMessage = `Databyss is getting back in sync.\n${writesPending} pending local changes\n${readsPending} pending remote changes`
  }

  return (
    <View
      alignItems="center"
      flexDirection="row"
      justifyContent="space-between"
      py="em"
      px="medium"
      backgroundColor="gray.7"
    >
      <Helmet>
        <meta charSet="utf-8" />
        <title>{path[0]}</title>
      </Helmet>
      <Text color="gray.4" variant="uiTextSmall">
        <div
          data-test-element="editor-sticky-header"
          dangerouslySetInnerHTML={{ __html: path.join(' / ') }}
        />
      </Text>
      <View alignItems="center" justifyContent="flex-end" flexDirection="row">
        {children}
        <View alignItems="center" justifyContent="flex-end" flexDirection="row">
          {!isDbBusy && (
            <View id="changes-saved">
              {' '}
              &nbsp;
              {/* this is used in tests to confirm the page has been saved */}
            </View>
          )}
          <View
            backgroundColor={
              !debouncedIsOnline || debouncedIsDbBusy ? 'orange.2' : 'green.0'
            }
            title={statusMessage}
            p="extraSmall"
            borderRadius="round"
          />
        </View>
        <AccountMenu />

        {contextMenu && <View ml="em">{contextMenu}</View>}
      </View>
    </View>
  )
}
