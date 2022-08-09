/* eslint-disable react/no-danger */
import React, { ReactNode, PropsWithChildren } from 'react'
import { Helmet } from 'react-helmet'
import { View, Text } from '@databyss-org/ui/primitives'
import { isMobile } from '@databyss-org/ui/lib/mediaQuery'
import { AccountMenu } from '@databyss-org/ui/components'
import { Status } from './Status'

interface StickyHeaderProps {
  path: string[]
  contextMenu?: ReactNode
}

export const StickyHeader = ({
  path,
  contextMenu,
  children,
}: PropsWithChildren<StickyHeaderProps>) => {
  const _isMobile = isMobile()
  const _joinedPath = path.join(' / ')

  return React.useMemo(() => {
    if (_isMobile) {
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
            dangerouslySetInnerHTML={{ __html: _joinedPath }}
          />
        </Text>
        <View alignItems="center" justifyContent="flex-end" flexDirection="row">
          {children}
          <Status />
          <AccountMenu />

          {contextMenu && <View ml="em">{contextMenu}</View>}
        </View>
      </View>
    )
  }, [_joinedPath, contextMenu, children, _isMobile])
}
