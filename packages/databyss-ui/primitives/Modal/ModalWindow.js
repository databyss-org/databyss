import React from 'react'
import Modal from './Modal'
import { isMobileOs } from '../../lib/mediaQuery'
import ModalView from './ModalView'
import makeAnimations from './animations'

const mobileCss = closing => ({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'auto',
  top: closing ? '100%' : 0,
})

const _mobile = isMobileOs()

const ModalWindow = ({
  children,
  visible,
  onDismiss,
  widthVariant,
  onModalOpen,
  ...others
}) => {
  const animations = makeAnimations({
    slide: {
      '0%': {
        top: '100%',
      },
      '100%': {
        top: '0',
      },
    },
  })
  const onClose = () => {
    if (!_mobile) {
      onDismiss()
      return
    }
    animations.slide.outro.run(onDismiss)
  }
  const onOpen = () => {
    onModalOpen()
    if (!_mobile) {
      return
    }
    animations.slide.intro.run()
  }

  return (
    <Modal
      shadowVariant={_mobile ? 'none' : 'modal'}
      widthVariant={_mobile ? 'none' : widthVariant}
      showOverlay={!_mobile}
      onDismiss={onDismiss}
      onOpen={onOpen}
      visible={visible}
      {...(_mobile
        ? {
            overrideCss: [
              mobileCss(animations.slide.outro.css),
              animations.slide.intro.css,
              animations.slide.outro.css,
            ],
          }
        : {})}
    >
      <ModalView {...others} onDismiss={onClose}>
        {children}
      </ModalView>
    </Modal>
  )
}

ModalWindow.defaultProps = {
  onDismiss: () => null,
  widthVariant: 'modal',
}

export default ModalWindow
