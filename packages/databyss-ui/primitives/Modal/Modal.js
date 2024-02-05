import React, { useCallback } from 'react'
import ReactModal from 'react-modal'
import { position, color, compose, shadow } from 'styled-system'
import css from '@styled-system/css'
import { zIndex } from '@databyss-org/ui/theming/system'
import { shadowVariant, widthVariant } from '../View/View'
import styled from '../styled'
import theme, { borderRadius } from '../../theming/theme'

const StyledReactModal = styled(
  ReactModal,
  compose(shadow, position, color, widthVariant, zIndex)
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
  canDismiss,
  onOpen,
  showOverlay,
  overrideCss,
  concatCss,
  zIndex,
  ...others
}) => {
  const onOverlayRef = useCallback((ref) => {
    if (!ref) {
      return
    }
    ref.parentNode.style.position = 'relative'
    ref.parentNode.style.zIndex = css({ zIndex })(theme).zIndex
  })

  return (
    <StyledReactModal
      isOpen={visible}
      appElement={document.getElementById('root')}
      onAfterOpen={onOpen}
      onRequestClose={canDismiss ? onDismiss : () => {}}
      boxShadow="0 0px 6px"
      color="modalShadow"
      backgroundColor="background.0"
      css={overrideCss || [_css].concat(concatCss)}
      overlayRef={onOverlayRef}
      style={{
        overlay: {
          backgroundColor: showOverlay ? 'rgba(0, 0, 0, 0.35)' : 'transparent',
          zIndex: theme.zIndex.base,
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
}

Modal.defaultProps = {
  onDismiss: () => null,
  onOpen: () => null,
  showOverlay: true,
  widthVariant: 'modal',
  zIndex: 'modal',
}

export default Modal
