import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import {
  useFloating,
  FloatingPortal,
  useClientPoint,
  useInteractions,
  offset,
  shift,
  flip,
} from '@floating-ui/react'
import { useAppState } from '@databyss-org/desktop/src/hooks'
import { DropdownList, MenuItem } from '../Menu/DropdownList'
import { DropdownContainer, ListProps } from '../..'
import ClickAwayListener from '../Util/ClickAwayListener'
import { theme } from '../../theming'
import { darkContentTheme } from '../../theming/theme'

export interface ContextMenuOptions extends ListProps {
  menuItems: MenuItem[]
  dropdownContainerProps?: any
  data: any
  onDismiss?: () => void
  clientPointOffsetX?: number
  clientPointOffsetY?: number
  onChange?: (value: any) => void
}

export interface ContextMenuContextType {
  showMenu: (options: ContextMenuOptions) => void
  isMenuVisible: boolean
  setClientPoint: (x: number, y: number) => void
}

export const ContextMenuContext = createContext<ContextMenuContextType>(null!)

export const ContextMenuProvider = ({ children }) => {
  const isDarkModeRes = useAppState('darkMode')
  const { refs, floatingStyles, context } = useFloating({
    placement: 'left-start',
    middleware: [
      offset({
        mainAxis: 0,
        crossAxis: 0,
      }),
      shift(),
      flip({
        crossAxis: false,
      }),
    ],
  })
  const menuClientPoint = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  // const menuOnDismiss = useRef<() => void>(null)
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuOptions, setMenuOptions] = useState<ContextMenuOptions | null>(
    null
  )

  const clientPoint = useClientPoint(context, {
    // axis: 'x',
    x: menuClientPoint.current.x + (menuOptions?.clientPointOffsetX ?? 0),
    y: menuClientPoint.current.y + (menuOptions?.clientPointOffsetY ?? 0),
  })

  const { getFloatingProps } = useInteractions([clientPoint])

  const showMenu = useCallback(
    (options: ContextMenuOptions) => {
      setMenuOptions(options)
      setMenuVisible(true)
    },
    [setMenuOptions, setMenuVisible]
  )

  const setClientPoint = useCallback(
    (x: number, y: number) => {
      menuClientPoint.current = { x, y }
    },
    [menuClientPoint]
  )

  let _menuView: ReactNode | null = null
  if (menuVisible && menuOptions) {
    const { dropdownContainerProps, data, menuItems } = menuOptions

    const _floatingProps = getFloatingProps()

    _menuView = (
      <FloatingPortal>
        <ClickAwayListener
          onClickAway={() => {
            setMenuVisible(false)
            setMenuOptions(null)
            if (menuOptions.onDismiss) {
              menuOptions.onDismiss()
            }
          }}
        >
          <DropdownContainer
            widthVariant="dropdownMenuMedium"
            open
            ref={refs.setFloating}
            style={floatingStyles}
            backgroundColor="background.1"
            maxHeight="85vh"
            overflowY="auto"
            theme={isDarkModeRes.data ? darkContentTheme : theme}
            {..._floatingProps}
            {...dropdownContainerProps}
            css={{
              ...(_floatingProps.css ?? {}),
              zIndex: theme.zIndex.modal + 2,
            }}
          >
            <DropdownList
              data={data}
              onChange={menuOptions.onChange}
              menuItems={menuItems}
              dismiss={() => {
                setMenuVisible(false)
                if (menuOptions.onDismiss) {
                  menuOptions.onDismiss()
                }
              }}
            />
          </DropdownContainer>
        </ClickAwayListener>
      </FloatingPortal>
    )
  }

  return (
    <ContextMenuContext.Provider
      value={{
        showMenu,
        isMenuVisible: menuVisible,
        setClientPoint,
      }}
    >
      {_menuView}
      {children}
    </ContextMenuContext.Provider>
  )
}

export const useContextMenu = () => useContext(ContextMenuContext)
