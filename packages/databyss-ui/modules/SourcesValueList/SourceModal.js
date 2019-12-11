import React, { useState } from 'react'
import {
  useSourceContext,
  withSource,
} from '@databyss-org/services/sources/SourceProvider'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import {
  View,
  Grid,
  ModalWindow,
  TextControl,
  List,
} from '@databyss-org/ui/primitives'
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
      dismissChild="Save"
      secondaryChild="Cancel"
    >
      <SourcesValueList onValueChange={onChange} sourceId={sourceId} />
    </ModalWindow>
  )
}

export default SourceModal
