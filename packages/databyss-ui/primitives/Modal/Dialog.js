import React from 'react'
import Modal from './Modal'
import DialogView from './DialogView'

const _css = {
  width: `auto`,
}
const Dialog = ({ visible, ...others }) => (
  <Modal
    widthVariant="dialog"
    concatCss={_css}
    visible={visible}
    zIndex="dialog"
  >
    <DialogView {...others} />
  </Modal>
)

export default Dialog
