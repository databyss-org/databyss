/* eslint-disable react/no-danger */
import React, { ReactNode, PropsWithChildren, useState, useRef } from 'react'
import { Helmet } from 'react-helmet'
import {
  View,
  Text,
  BaseControlProps,
  Icon,
  BaseControl,
  RawHtml,
} from '@databyss-org/ui/primitives'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import { isMobile } from '@databyss-org/ui/lib/mediaQuery'
// import { AccountMenu } from '@databyss-org/ui/components'
// import { Status } from './Status'
import { theme } from '../../theming'
import { pxUnits } from '../../theming/views'
// import { pxUnits } from '../../theming/views'

interface StickyHeaderProps {
  path: string[]
  contextMenu?: ReactNode
  draggable?: BaseControlProps['draggable']
}

export const StickyPath = ({ path }: { path: string[] }) => (
  <>
    {path.map((part, idx) => (
      <>
        <RawHtml
          color="text.1"
          variant="uiTextSmall"
          html={part}
          css={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
          title={part}
        />
        {idx < path.length - 1 ? (
          <Text color="text.1" variant="uiTextSmall" px="tiny">
            /
          </Text>
        ) : null}
      </>
    ))}
  </>
)

export const StickyHeader = ({
  path,
  contextMenu,
  children,
  draggable,
}: PropsWithChildren<StickyHeaderProps>) => {
  const _isMobile = isMobile()
  const _joinedPath = path.join(' / ')
  const [showDragHandle, setShowDragHandle] = useState<boolean>(false)
  const [dragHandlePressed, setDragHandlePressed] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const outTimerRef = useRef<any>(0)
  const inTimerRef = useRef<any>(0)

  const _showDragHandle = draggable && showDragHandle

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
        pr="medium"
        pl={pxUnits(18)}
        bg="background.2"
      >
        <Helmet>
          <meta charSet="utf-8" />
          <title>{path[0]}</title>
        </Helmet>
        {draggable && (
          <BaseControl
            ml="tinyNegative"
            position="absolute"
            mr="tiny"
            flexShrink={1}
            p="tiny"
            zIndex={theme.zIndex.sticky + 1}
            onDrag={() => {
              if (dragHandlePressed) {
                setTimeout(() => {
                  setDragHandlePressed(false)
                  setShowDragHandle(false)
                }, 50)
              }
              clearTimeout(outTimerRef.current)
              clearTimeout(inTimerRef.current)
            }}
            onDragStart={() => {
              setDragHandlePressed(true)
              setIsDragging(true)
            }}
            onDragEnd={() => {
              setIsDragging(false)
            }}
            onMouseUp={() => {
              setDragHandlePressed(false)
            }}
            onMouseOver={() => {
              clearTimeout(outTimerRef.current)
              setShowDragHandle(true)
            }}
            onMouseOut={() => {
              clearTimeout(inTimerRef.current)
              outTimerRef.current = setTimeout(() => {
                setShowDragHandle(false)
              }, 50)
            }}
            draggable={draggable}
            pressedColor="gray.6"
            css={{
              opacity: showDragHandle ? 1 : 0,
              ...(showDragHandle
                ? {
                    transition: 'opacity 0.2s ease 0.1s',
                  }
                : {
                    transition: 'none',
                  }),
            }}
            childViewProps={{
              flexDirection: 'row',
              flexWrap: 'nowrap',
              alignItems: 'center',
            }}
          >
            <Icon sizeVariant="tiny" color="gray.4">
              <PageSvg />
            </Icon>
            {dragHandlePressed && (
              <Text variant="uiTextSmall" ml="3px">
                <div
                  dangerouslySetInnerHTML={{
                    __html: `${_joinedPath.substring(0, 24)}...`,
                  }}
                />
              </Text>
            )}
          </BaseControl>
        )}
        <View
          flexGrow={1}
          flexShrink={1}
          css={{
            paddingLeft: _showDragHandle ? '20px' : 0,
            transition: 'padding-left 0.2s ease',
            ...(isDragging ? { cursor: 'pointer' } : {}),
          }}
          position="relative"
          onMouseOver={() => {
            clearTimeout(outTimerRef.current)
            inTimerRef.current = setTimeout(() => {
              setShowDragHandle(true)
            }, 300)
          }}
          onMouseOut={() => {
            clearTimeout(inTimerRef.current)
            outTimerRef.current = setTimeout(() => {
              setShowDragHandle(false)
            }, 50)
          }}
          flexDirection="row"
          flexWrap="nowrap"
          minWidth={0}
          overflow="hidden"
        >
          {!dragHandlePressed && <StickyPath path={path} />}
        </View>
        <View alignItems="center" justifyContent="flex-end" flexDirection="row">
          {children}
          {/* <Status /> */}
          {/* <AccountMenu /> */}

          {contextMenu && <View ml="em">{contextMenu}</View>}
        </View>
      </View>
    )
  }, [
    _joinedPath,
    contextMenu,
    children,
    _isMobile,
    showDragHandle,
    dragHandlePressed,
  ])
}
