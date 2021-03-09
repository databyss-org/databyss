/* eslint-disable react/no-danger */
import React, { ReactNode, PropsWithChildren } from 'react'
import { Helmet } from 'react-helmet'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { View, Icon, Text } from '@databyss-org/ui/primitives'
import { isMobile } from '@databyss-org/ui/lib/mediaQuery'
import OnlineSvg from '@databyss-org/ui/assets/online.svg'
import OfflineSvg from '@databyss-org/ui/assets/offline.svg'
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

  if (isMobile()) {
    return null
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
        <Icon
          sizeVariant="small"
          color="gray.5"
          title={isOnline ? 'Online' : 'Offline'}
          ml="small"
        >
          {isOnline ? <OnlineSvg /> : <OfflineSvg />}
        </Icon>
        <AccountMenu />

        {contextMenu && <View ml="em">{contextMenu}</View>}
      </View>
    </View>
  )
}
