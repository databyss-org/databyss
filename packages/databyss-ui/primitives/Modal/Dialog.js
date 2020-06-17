import React from 'react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import Modal from './Modal'
import DialogView from './DialogView'

const _css = {
  width: `auto`,
}
const Dialog = ({ visible, ...others }) => {
  const navigationProvider = useNavigationContext()

  // hide all modals
  if (navigationProvider && navigationProvider.modals.length && visible) {
    navigationProvider.hideModal()
  }

  return (
    <Modal widthVariant="dialog" concatCss={_css} visible={visible}>
      <DialogView {...others} />
    </Modal>
  )
}

export default Dialog
