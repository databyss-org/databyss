import {
  View,
  Button,
  Text,
  Grid,
  ModalWindow,
} from '@databyss-org/ui/primitives'

const SourceModal = (visible, props, dismiss) => {
  return (
    <ModalWindow
      visible={visible}
      onDismiss={() => dismiss()}
      title="Edit Source"
      dismissChild="Save"
      secondaryChild="Cancel"
    >
      <Text>{props}</Text>
    </ModalWindow>
  )
}

export const modalDict = {
  SOURCE: SourceModal,
}
