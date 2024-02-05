import React, { useState } from 'react'

import { ModalWindow } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import CitationProvider from '@databyss-org/services/citations/CitationProvider'
import EditSourceForm from '../../components/SourceForm/EditSourceForm'

// component
const MetadataModal = ({ id, visible, source, dismissCallback }) => {
  const [values, setValues] = useState(source)

  const { hideModal } = useNavigationContext()

  const onDismiss = () => {
    if (dismissCallback) {
      dismissCallback(values)
    }
    hideModal()
  }

  // render methods
  const render = () => (
    <ModalWindow
      visible={visible}
      key={id}
      widthVariant="form"
      onDismiss={onDismiss}
      title="Edit Metadata"
      dismissChild="save"
      canDismiss
    >
      <CitationProvider>
        <EditSourceForm onChange={setValues} values={values} />
      </CitationProvider>
    </ModalWindow>
  )

  return render()
}

export default MetadataModal
