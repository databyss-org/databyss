import React from 'react'
import ReactModal from 'react-modal'
import { position, color, compose } from 'styled-system'
import { shadowVariant, widthVariant } from '../View/View'
import styled from '../styled'
import theme, { borderRadius } from '../../theming/theme'

const StyledReactModal = styled(
  ReactModal,
  compose(
    position,
    color,
    shadowVariant,
    widthVariant
  )
)

const _css = {
  top: '50%',
  left: '50%',
  right: 'auto',
  bottom: 'auto',
  marginRight: '-50%',
  transform: 'translate(-50%, -50%)',
  width: `calc(100% - ${theme.space[5] * 2}px)`,
  maxHeight: `calc(100% - ${theme.space[5] * 2}px)`,
  overflow: 'hidden',
  borderRadius,
  display: 'flex',
}

const Modal = ({
  children,
  visible,
  onDismiss,
  onOpen,
  showOverlay,
  overrideCss,
  appendCss,
  ...others
}) => (
  <StyledReactModal
    position="absolute"
    isOpen={visible}
    appElement={document.getElementById('root')}
    onAfterOpen={onOpen}
    onRequestClose={onDismiss}
    shadowVariant="modal"
    backgroundColor="background.0"
    css={overrideCss || [_css, appendCss]}
    style={{
      overlay: {
        backgroundColor: showOverlay ? 'rgba(0, 0, 0, 0.35)' : 'transparent',
        zIndex: 1,
        overflow: 'hidden',
      },
      content: {
        overflow: 'hidden',
      },
    }}
    {...others}
  >
    {children}
  </StyledReactModal>
)

Modal.defaultProps = {
  onDismiss: () => null,
  onOpen: () => null,
  showOverlay: true,
  widthVariant: 'modal',
}

export default Modal
