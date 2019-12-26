import React, { useState } from 'react'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { ModalWindow } from '@databyss-org/ui/primitives'
import { hideModal } from '@databyss-org/ui/components/Navigation/NavigationProvider/actions'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import SourcesValueList from './SourcesValueList'
import TestSource from './TestSourcev2'

const SourceModal = ({ sourceId, visible, onUpdateSource }) => {
  const { setSource } = useSourceContext()
  const [values, setValues] = useState(null)
  const [, dispatchNav] = useNavigationContext()

  const onChange = _values => {
    // update internal state
    setValues(_values)
    if (_values) {
      // updates in source provider
      //  setSource(_values)
    }
  }

  const onBlur = () => {
    if (values) {
      setSource(values)
    }
  }

  const onDismiss = () => {
    if (values) {
      // updates in source provider
      setSource(values)
    }
    // hide modal in navProvider
    dispatchNav(hideModal())
    // update to editor provider
    // onUpdateSource(values)
  }

  console.log(document.activeElement)

  return (
    <ModalWindow
      visible={visible}
      widthVariant="form"
      onDismiss={onDismiss}
      title="Edit Source"
      dismissChild="done"
    >
      <TestSource
        onValueChange={onChange}
        sourceId={sourceId}
        onValueBlur={onBlur}
      />

      {/* <SourcesValueList
        onValueChange={onChange}
        sourceId={sourceId}
        onValueBlur={onBlur}
        value={values}
      /> */}
    </ModalWindow>
  )
}

export default SourceModal
