import {
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
import { Text } from '@databyss-org/editor/interfaces'

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
  extends SpaceProps,
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
declare const ScrollView: FC<PropsWithChildren<ViewProps>>

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
}

declare const TextPrimitive: RefForwardingFC<PropsWithChildren<TextProps>>

export interface RawHtmlProps extends ColorProps, SpaceProps, BorderProps {
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
  verticalItemPadding?: ReactText
  removeBorderRadius?: boolean
  keyboardNavigation?: boolean
}

declare const List: FC<PropsWithChildren<ListProps>>

export interface SeparatorProps extends ViewProps {
  spacing?: ReactText
}

declare const Separator: FC<SeparatorProps>

//
// Controls
// ----------------------------------------------------------------------

export interface ControlHandle {
  press: () => void
}

export interface BaseControlProps {
  hoverColor?: string
  activeColor?: string
  pressedColor?: string
  borderRadius?: ReactText
  userSelect?: CSS.Property.UserSelect
  active?: boolean
  disabled?: boolean
  onPress?: (e: MouseEvent | KeyboardEvent) => void
  href?: string
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
}

export interface ToggleControlProps
  extends BaseControlProps,
    ControlLabelProps {
  alignLabel?: 'left' | 'right'
  value?: string
  onChange?: (e: MouseEvent | KeyboardEvent) => void
}

declare const ToggleControl: FC<PropsWithChildren<ToggleControlProps>>
declare const SwitchControl: FC<ToggleControlProps>

export interface ButtonProps extends BaseControlProps {
  variant?: string
  textVariant?: string
}

declare const Button: RefForwardingFC<PropsWithChildren<ButtonProps>>

export interface TextInputProps extends TextProps {
  value: Partial<Text>
  onChange: (value: Text) => void
  multiline?: boolean
  active?: boolean
  concatCss?: InterpolationWithTheme<any>
  readonly?: boolean
  autoFocus?: boolean
}

declare const TextInput: RefForwardingFC<TextInputProps>

export interface RichTextInputProps {
  value: Partial<Text>
  onChange: (value: Text) => void
  multiline?: boolean
  active?: boolean
  concatCss?: InterpolationWithTheme<any>
  onFocus?: () => void
  onBlur?: () => void
}

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
  message?: string
  confirmButtons?: ReactNode[]
  onConfirm?: (e: MouseEvent | KeyboardEvent) => void
  showConfirmButtons?: boolean
  html?: string
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
