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
import { InterpolationWithTheme } from '@emotion/core'

export type RefForwardingFC<T, P = {}> = ForwardRefExoticComponent<
  PropsWithoutRef<P> & RefAttributes<T>
>

//
// View
// ----------------------------------------------------------------------

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
}

declare const View: RefForwardingFC<HTMLElement, PropsWithChildren<ViewProps>>
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

declare const Text: RefForwardingFC<HTMLElement, PropsWithChildren<TextProps>>

export interface RawHtmlProps extends ColorProps, SpaceProps, BorderProps {
  _html?: string
  html?: string
}

declare const RawHtml: RefForwardingFC<HTMLElement, RawHtmlProps>

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
  hoverColor: string
  activeColor: string
  pressedColor: string
  borderRadius: ReactText
  userSelect: CSS.Property.UserSelect
  active?: boolean
  disabled?: boolean
  onPress?: (e: MouseEvent | KeyboardEvent) => void
  href?: string
  handle: MutableRefObject<ControlHandle>
  noFeedback?: boolean
  childViewProps?: ViewProps
  onKeyDown?: (e: KeyboardEvent) => void
}

declare const BaseControl: RefForwardingFC<HTMLElement, BaseControlProps>

export interface ValueControlProps {
  value?: string
  onChange?: (e: MouseEvent | KeyboardEvent) => void
}

export interface ControlLabelProps {
  label?: string
  labelProps?: ViewProps
}

export interface ToggleControlProps
  extends BaseControlProps,
    ValueControlProps,
    ControlLabelProps {
  alignLabel?: 'left' | 'right'
}

declare const ToggleControl: FC<PropsWithChildren<ToggleControlProps>>
declare const SwitchControl: FC<ToggleControlProps>

export interface ButtonProps extends BaseControlProps {
  variant?: string
  textVariant?: string
}

declare const Button: RefForwardingFC<PropsWithChildren<ButtonProps>>

export interface TextControlProps
  extends BaseControlProps,
    ValueControlProps,
    ControlLabelProps {
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
