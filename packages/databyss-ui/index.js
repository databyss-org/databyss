/* eslint-disable-next-line react/no-typos */
import 'react'

/* styles and theming */
export { theme, macros, colors, ThemeProvider } from './theming'

/* media query */
export { isMobile, isMobileOs, isMobileOrMobileOs } from './lib/mediaQuery'

/* components */
export {
  NavigationProvider,
  useNavigationContext,
} from './components/Navigation/NavigationProvider'
export { default as DropdownContainer } from './components/Menu/DropdownContainer'

/* hooks */
export { useScrollMemory } from './hooks/scrollMemory/useScrollMemory'

/* modules */
export { default as ModalManager } from './modules/Modals/ModalManager'
export { DropZoneManager } from './components/DropZone/DropZoneManager'
export { default as Content } from './components/Viewport/Content'
export { default as Raw } from './components/Viewport/Raw'
export { default as ThemedViewport } from './components/Viewport/ThemedViewport'
export { default as Viewport } from './components/Viewport/Viewport'
export { Sidebar } from './modules/Sidebar/Sidebar'
export { default as PageContent } from './components/PageContent/PageContent'
export { SearchContent } from './modules/IndexPages/SearchContent'

/* primitives */
export { pxUnits } from '@databyss-org/ui/theming/views'
export { default as View } from './primitives/View/View'
export { default as ScrollView } from './primitives/View/ScrollView'
export { default as Text } from './primitives/Text/Text'
export { default as BaseControl } from './primitives/Control/BaseControl'
export { default as ToggleControl } from './primitives/Control/ToggleControl'
export { default as SwitchControl } from './primitives/Control/SwitchControl'
export { default as TextControl } from './primitives/Control/TextControl'
export { default as DropDownControl } from './primitives/Control/DropDownControl'
export { default as List } from './primitives/List/List'
export { default as Separator } from './primitives/List/Separator'
export { default as Button } from './primitives/Button/Button'
export { default as Icon } from './primitives/Icon/Icon'
export { default as Modal } from './primitives/Modal/Modal'
export { default as ModalWindow } from './primitives/Modal/ModalWindow'
export { default as Dialog } from './primitives/Modal/Dialog'
export { default as Grid } from './primitives/Grid/Grid'
export { default as TextInput } from './primitives/Control/native/TextInput'
export { default as RichTextInput } from './primitives/Control/native/RichTextInput'
export { default as RawHtml } from './primitives/Text/RawHtml'
export { default as Switch } from './primitives/Control/native/Switch'
export { default as styled } from './primitives/styled'
export { useKeyboardNavigationContext } from './primitives/List/KeyboardNavigationProvider'
export {
  withKeyboardNavigation,
  default as KeyboardNavigationItem,
} from './primitives/List/KeyboardNavigationItem'
export {
  default as GestureProvider,
  useDrag,
  useDrop,
} from './primitives/Gestures/GestureProvider'
