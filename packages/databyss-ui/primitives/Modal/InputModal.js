import React from 'react'
import ReactModal from 'react-modal'
import { position, color, compose } from 'styled-system'
import { View } from '../'
import styled from '../styled'
import makeAnimations from './animations'

ReactModal.setAppElement('#root')

const StyledReactModal = styled(
  ReactModal,
  compose(
    position,
    color
  )
)

const Modal = ({ children, visible, onDismiss, ...others }) => {
  const animations = makeAnimations({
    slide: {
      '0%': {
        transform: 'translateY(-100%)',
      },
      '100%': {
        transform: 'translateY(0)',
      },
    },
  })

  const onClose = () => {
    animations.slide.outro.run(onDismiss)
  }
  const onOpen = () => {
    animations.slide.intro.run()
  }

  return (
    <StyledReactModal
      position="absolute"
      isOpen={visible}
      onAfterOpen={onOpen}
      onRequestClose={onClose}
      css={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          overflow: 'auto',
          transform: animations.slide.outro.css
            ? 'translateY(-100%)'
            : 'translateY(0)',
        },
        animations.slide.intro.css,
        animations.slide.outro.css,
      ]}
      style={{
        overlay: {
          backgroundColor: 'transparent',
        },
      }}
    >
      <View backgroundColor="black" {...others}>
        {children}
      </View>
    </StyledReactModal>
  )
}

Modal.defaultProps = {
  onDismiss: () => null,
}

export default Modal
