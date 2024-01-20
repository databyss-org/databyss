import React, {
  MutableRefObject,
  ReactNode,
  useImperativeHandle,
  useRef,
} from 'react'
import { Text, BaseControl, View, Icon } from '@databyss-org/ui/primitives'
import { useDocument } from '@databyss-org/data/pouchdb/hooks/useDocument'
import { Block, Page, Source } from '@databyss-org/services/interfaces'
import ChevronSvg from '@databyss-org/ui/assets/chevron-filled.svg'
import { pxUnits } from '../../theming/views'
import { withKeyboardNavigation } from '../../primitives/List/KeyboardNavigationItem'
import { ControlHandle, ViewProps } from '../..'
import { MenuItem } from '../Menu/DropdownList'
import { ContextMenu } from '../Menu/ContextMenu'

export const SidebarListRow = ({
  children,
  text,
  icon,
  isActive,
  iconColor,
  depth = 0,
  expandable,
  expanded,
  onExpand,
  ...others
}: {
  children: ReactNode
  text: string
  icon: ReactNode
  isActive: boolean
  iconColor?: string
  depth: number
  expandable?: boolean
  expanded?: boolean
  onExpand?: (
    evt: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>
  ) => void
}) => (
  <View
    width="100%"
    flexDirection="row"
    alignItems="flex-start"
    justifyContent="space-between"
    {...others}
    {...(expandable
      ? {
          pl: pxUnits(7),
        }
      : {})}
  >
    <View
      flexDirection="row"
      flexWrap="nowrap"
      maxWidth="100%"
      flexShrink={1}
      // alignItems={expandable ? 'center' : 'unset'}
    >
      {depth > 0 && (
        <View
          position="absolute"
          top={0}
          bottom={pxUnits(1)}
          overflow="hidden"
          width={pxUnits(3.5)}
          borderRightWidth={pxUnits(1)}
          borderRightStyle="dotted"
          borderRightColor="gray.4"
        />
      )}
      {expandable && (
        <BaseControl
          onPress={onExpand}
          ml={pxUnits(4)}
          mr={pxUnits(5)}
          mt={pxUnits(2)}
        >
          <ChevronSvg
            css={{
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease-in-out',
            }}
          />
        </BaseControl>
      )}
      <Icon
        sizeVariant="tiny"
        color={iconColor ?? (isActive ? 'text.1' : 'text.3')}
        mr="small"
        ml={depth > 0 ? pxUnits(14.5) : 'none'}
        mt={pxUnits(1)}
      >
        {icon}
      </Icon>
      <Text
        variant="uiTextSmall"
        color={isActive ? 'text.1' : 'text.3'}
        userSelect="none"
      >
        {text}
      </Text>
    </View>
    {children}
  </View>
)

export interface SidebarListItemProps {
  isActive: boolean
  text: string
  data: any
  href: string
  icon: ReactNode
  onPress: () => void
  children: ReactNode
  activeNavigationItem: boolean
  navigationItemRef: MutableRefObject<HTMLElement>
  navigationItemHandle: MutableRefObject<any>
  draggable: boolean
  depth: number
  contextMenu?: MenuItem[]
  dropzone?: ViewProps['dropzone']
}

const SidebarListItem = ({
  isActive,
  text,
  data,
  href,
  icon,
  onPress,
  children,
  activeNavigationItem,
  navigationItemRef,
  navigationItemHandle,
  draggable,
  depth = 0,
  contextMenu,
  ...others
}: SidebarListItemProps) => {
  const docRes = useDocument(data?._id, {
    enabled: !!data?._id,
  })
  // console.log(docRes.data)
  const _controlHandle = useRef<ControlHandle | null>(null)
  useImperativeHandle(navigationItemHandle, () => ({
    selectNavigationItem: () => {
      if (href) {
        _controlHandle.current?.press()
      } else {
        onPress()
      }
    },
  }))

  const _text =
    (docRes.data as Source)?.name?.textValue ??
    (docRes.data as Page)?.name ??
    (docRes.data as Block)?.text?.textValue ??
    text

  return (
    <BaseControl
      data-test-element="page-sidebar-item"
      href={href}
      onPress={onPress}
      active={isActive || activeNavigationItem}
      ref={navigationItemRef}
      handle={_controlHandle}
      draggable={draggable}
      position="relative"
      focusVisible
      {...(depth > 0
        ? {
            borderWidth: 0,
          }
        : {})}
    >
      <SidebarListRow
        isActive={isActive}
        icon={icon}
        text={_text}
        depth={depth}
        {...others}
      >
        {contextMenu ? (
          <ContextMenu
            menuItems={contextMenu}
            data={data}
            menuViewProps={{
              hoverColor: 'background.3',
              mt: pxUnits(2),
              ml: pxUnits(7),
            }}
            parentRef={navigationItemRef}
          />
        ) : null}
        {children}
      </SidebarListRow>
    </BaseControl>
  )
}

export default withKeyboardNavigation(SidebarListItem)
