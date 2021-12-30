import React, {
  PropsWithChildren,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
  FC,
  ReactText,
  MutableRefObject,
  ReactNode,
  KeyboardEvent,
  MouseEvent,
} from 'react'
import {
  SpaceProps,
  LayoutProps,
  FlexboxProps,
  BorderProps,
  PositionProps,
  ColorProps,
  ShadowProps,
  Theme,
  TypographyProps,
} from 'styled-system'
import * as ReactModal from 'react-modal'
import * as ReactDnd from 'react-dnd'
import { InterpolationWithTheme } from '@emotion/core'
import { Text as TextInterface } from '@databyss-org/editor/interfaces'
import { CSSObject } from '@styled-system/css'

export type RefForwardingFC<P, T = HTMLElement> = ForwardRefExoticComponent<
  PropsWithoutRef<P> & RefAttributes<T>
>

// TODO: add type hints to theme
// see https://blog.agney.dev/styled-components-&-typescript/

//
// View
// ----------------------------------------------------------------------

export interface DraggableItem {
  type: string
  payload?: any
}

export interface DropzoneProps {
  accepts?: string
  onDrop?: (item: DraggableItem) => void
}

export interface ViewProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    SpaceProps,
    LayoutProps,
    FlexboxProps,
    BorderProps,
    PositionProps,
    ColorProps,
    ShadowProps {
  theme?: Theme
  paddingVariant?: string
  borderRadius?: string
  borderVariant?: string
  hlineVariant?: string
  shadowVariant?: string
  widthVariant?: string
  wrapVariant?: string
  dropzone?: boolean | DropzoneProps
}

declare const View: RefForwardingFC<PropsWithChildren<ViewProps>>

export interface ScrollViewProps extends ViewProps {
  /**
   * Add a small inset shadow to the top of the scroll view when scrolled.
   * Set to true to use the default color, or set to a string to specify the color.
   * NOTE: uses fixed positioning, so add "transform: translate(0, 0)" to the parent
   * element for correct positioning and sizing.
   */
  shadowOnScroll?: boolean | string
}

declare const ScrollView: RefForwardingFC<PropsWithChildren<ScrollViewProps>>

export interface GridProps extends ViewProps {
  columnGap?: ReactText
  rowGap?: ReactText
  singleRow?: boolean
  singleColumn?: boolean
}

declare const Grid: FC<PropsWithChildren<GridProps>>

//
// Text
// ----------------------------------------------------------------------

export interface TextProps
  extends LayoutProps,
    SpaceProps,
    ColorProps,
    TypographyProps {
  variant?: string
  css?: InterpolationWithTheme<any>
  userSelect?: CSS.Property.UserSelect
}

declare const TextPrimitive: RefForwardingFC<PropsWithChildren<TextProps>>
declare const Text: RefForwardingFC<PropsWithChildren<TextProps>>

export interface RawHtmlProps extends TextProps, BorderProps {
  _html?: string
  html?: string
}

declare const RawHtml: RefForwardingFC<RawHtmlProps>

//
// Icon
// ----------------------------------------------------------------------

export interface IconProps extends ViewProps {
  sizeVariant?: string
  useSvgColors?: boolean
  title?: string
}

declare const Icon: FC<PropsWithChildren<IconProps>>

//
// List
// ----------------------------------------------------------------------

export interface KeyboardNavigationProps {
  keyboardEventsActive?: boolean
  orderKey?: ReactText
  onActiveIndexChanged?: (activeIndex: number) => void
  initialActiveIndex?: number
  onItemSelected?: (activeItem: ReactNode) => void
}

declare const KeyboardNavigationProvider: FC<PropsWithChildren<
  KeyboardNavigationProps
>>

export interface ListProps extends ViewProps, KeyboardNavigationProps {
  horizontalItemPadding?: ReactText
  horizontalItemMargin?: ReactText
  verticalItemPadding?: ReactText
  verticalItemMargin?: ReactText
  removeBorderRadius?: boolean
  keyboardNavigation?: boolean
}

declare const List: FC<PropsWithChildren<ListProps>>

export interface SeparatorProps extends ViewProps {
  spacing?: ReactText
  secondary?: boolean
  label?: string
  lineWidth?: number
}

declare const Separator: FC<SeparatorProps>

//
// Controls
// ----------------------------------------------------------------------

export interface ControlHandle {
  press: () => void
}

export interface BaseControlProps extends ViewProps {
  hoverColor?: string
  activeColor?: string
  pressedColor?: string
  borderRadius?: ReactText
  userSelect?: CSS.Property.UserSelect
  active?: boolean
  disabled?: boolean
  onPress?: (e: MouseEvent | KeyboardEvent) => void
  href?: string
  target?: string
  handle?: MutableRefObject<ControlHandle>
  noFeedback?: boolean
  childViewProps?: ViewProps
  onKeyDown?: (e: KeyboardEvent) => void
  draggable?: boolean | Partial<DraggableItem>
}

declare const BaseControl: RefForwardingFC<PropsWithChildren<BaseControlProps>>

export interface ControlLabelProps {
  label?: string
  labelProps?: ViewProps
  labelTextProps?: TextProps
}

export interface ToggleControlProps
  extends BaseControlProps,
    ControlLabelProps {
  alignLabel?: 'left' | 'right'
  value?: boolean
  onChange?: (value: boolean) => void
  textVariant?: string
}

declare const ToggleControl: FC<PropsWithChildren<ToggleControlProps>>
declare const SwitchControl: FC<ToggleControlProps>

export interface SwitchProps {
  value?: boolean
  disabled?: boolean
}

declare const Switch: FC<SwitchProps>

export interface ButtonProps extends BaseControlProps {
  variant?: string
  textVariant?: string
  textColor?: string
}

declare const Button: RefForwardingFC<PropsWithChildren<ButtonProps>>

export interface TextInputProps extends TextProps {
  value?: Partial<TextInterface>
  onChange?: (value: TextInterface) => void
  multiline?: boolean
  active?: boolean
  concatCss?: CSSObject
  readonly?: boolean
  autoFocus?: boolean
  placeholder?: string
  maxRows?: number
}

declare const TextInput: RefForwardingFC<TextInputProps>

declare const RichTextInput: RefForwardingFC<TextInputProps>

export interface TextControlProps extends BaseControlProps, ControlLabelProps {
  labelColor?: string
  activeLabelColor?: string
  labelVariant?: string
  inputVariant?: string
  id?: string
  gridFlexWrap?: CSS.Property.FlexWrap
  rich?: boolean
  modal?: boolean
  multiline?: boolean
  focusOnMount?: boolean
  css?: InterpolationWithTheme<any>
  dataTestId?: string
}

declare const TextControl: FC<TextControlProps>

interface DropDownControlItem {
  label: string
  id: string
}

interface DropDownControlGroup {
  label: string
  items: DropDownControlItem[]
}

interface DropDownControlProps extends HTMLSelectElement {
  concatCss: InterpolationWithTheme<any>
  ctaLabel?: string
  items: DropDownControlItem[]
  itemGroups: DropDownControlGroup[]
  onBlur: () => void
  onChange: (item: DropDownControlItem) => void
  onFocus: () => void
  value: DropDownControlItem
}

declare const DropDownControl: RefForwardingFC<DropDownControlProps>

//
// Modal
// ----------------------------------------------------------------------

export interface ModalProps {
  visible?: boolean
  onDismiss?: (e: MouseEvent | KeyboardEvent) => void
  canDismiss?: boolean
  onOpen?: ReactModal.OnAfterOpenCallback
  showOverlay?: boolean
  overrideCss?: InterpolationWithTheme<any>
  concatCss?: InterpolationWithTheme<any>
  zIndex?: ReactText
}

declare const Modal: FC<PropsWithChildren<ModalProps>>

export interface ModalViewProps extends ViewProps {
  title?: string
  dismissChild?: ReactNode
  secondaryChild?: ReactNode
  onDismiss?: (e: MouseEvent | KeyboardEvent) => void
  canDismiss?: boolean
}

export interface ModalWindowProps extends ModalProps, ModalViewProps {}

declare const ModalWindow: FC<PropsWithChildren<ModalWindowProps>>

export interface DialogViewProps extends ViewProps {
  message?: string | null
  confirmButtons?: ReactNode[]
  onConfirm?: (e: MouseEvent | KeyboardEvent) => void
  showConfirmButtons?: boolean
  html?: boolean
  dolphins?: boolean
}

export interface DialogProps extends DialogViewProps {
  visible?: boolean
}

declare const Dialog: FC<DialogProps>

//
// Gestures
// ----------------------------------------------------------------------

export interface GestureProviderProps extends PropsWithChildren<{}> {}

declare const GestureProvider: FC<GestureProviderProps>
declare const useDrop: <
  DragObject extends ReactDnd.DragObjectWithType,
  DropResult,
  CollectedProps
>(
  spec: ReactDnd.DropTargetHookSpec<DragObject, DropResult, CollectedProps>
) => [CollectedProps, ReactDnd.ConnectDropTarget]
declare const useDrag: <
  DragObject extends ReactDnd.DragObjectWithType,
  DropResult,
  CollectedProps
>(
  spec: ReactDnd.DragSourceHookSpec<DragObject, DropResult, CollectedProps>
) => [CollectedProps, ReactDnd.ConnectDragSource, ReactDnd.ConnectDragPreview]

//
// COMPONENTS
// ----------------------------------------------------------------------

//
// Dropdown
// ----------------------------------------------------------------------

export interface DropdownContainerProps
  extends Omit<ViewProps, 'position'>,
    Omit<ListProps, 'position'> {
  position?: {
    left?: number
    top?: number
    right?: number
    bottom?: number
  }
  open?: boolean
}

declare const DropdownContainer: FC<PropsWithChildren<DropdownContainerProps>>
