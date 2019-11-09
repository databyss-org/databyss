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
  // width: '100%',
  // height: '100%',
  overflow: 'hidden',
  borderRadius,
  display: 'flex',
  width: '100%',
}

const Modal = ({
  children,
  visible,
  onDismiss,
  onOpen,
  showOverlay,
  overrideCss,
  concatCss,
  ...others
}) => (
  <StyledReactModal
    isOpen={visible}
    appElement={document.getElementById('root')}
    onAfterOpen={onOpen}
    onRequestClose={onDismiss}
    shadowVariant="modal"
    backgroundColor="background.0"
    css={overrideCss || [_css].concat(concatCss)}
    style={{
      overlay: {
        backgroundColor: showOverlay ? 'rgba(0, 0, 0, 0.35)' : 'transparent',
        zIndex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: `${theme.space[5]}px`,
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
