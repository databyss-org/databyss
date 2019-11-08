import React from 'react'
import Modal from './Modal'
import theme from '../../theming/theme'
import DialogView from './DialogView'

const _css = {
  width: `calc(100% - ${theme.space.small}px)`,
}
const Dialog = ({ visible, ...others }) => (
  <Modal widthVariant="dialog" appendCss={_css} visible={visible}>
    <DialogView {...others} />
  </Modal>
)

export default Dialog
