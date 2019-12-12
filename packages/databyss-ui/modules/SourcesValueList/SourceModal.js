import React from 'react'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { ModalWindow } from '@databyss-org/ui/primitives'
import SourcesValueList from './SourcesValueList'

const SourceModal = ({ sourceId, visible, onUpdateSource, dismiss }) => {
  const [, setSource] = useSourceContext()

  const onChange = _values => {
    // updates in editor provider
    onUpdateSource(_values)
    // updates in source provider
    setSource(_values)
  }

  return (
    <ModalWindow
      visible={visible}
      onDismiss={() => dismiss()}
      title="Edit Source"
      dismissChild="done"
    >
      <SourcesValueList onValueChange={onChange} sourceId={sourceId} />
    </ModalWindow>
  )
}

export default SourceModal
