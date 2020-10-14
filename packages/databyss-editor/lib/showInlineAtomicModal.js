import { Transforms } from '@databyss-org/slate'
import { ReactEditor } from '@databyss-org/slate-react'
import { stateSelectionToSlateSelection } from './slateUtils'

export const showInlineAtomicModal = ({
  editorContext,
  navigationContext,
  editor,
}) => {
  // we need navigationContext and editorContext to show the modal
  if (!navigationContext || !editorContext) {
    return
  }
  const index = editorContext.state.selection.anchor.index
  const _entity = editorContext.state.blocks[index]
  const refId = _entity._id
  const type = _entity.type
  let offset
  let selection
  const { setContent, state } = editorContext
  const { showModal } = navigationContext

  // compose modal dismiss callback function
  const onUpdate = atomic => {
    // if atomic is saved, update content
    if (atomic) {
      const _selection = state.selection
      setContent({
        selection: _selection,
        operations: [
          {
            index,
            isRefEntity: true,
            text: atomic.text,
          },
        ],
      })

      // set offset for selection
      offset = atomic.text.textValue.length
    } else {
      offset = _entity.text.textValue.length
    }

    // on dismiss refocus editor at end of atomic
    window.requestAnimationFrame(() => {
      selection = {
        anchor: { index, offset },
        focus: { index, offset },
      }
      const _slateSelection = stateSelectionToSlateSelection(
        editor.children,
        selection
      )
      Transforms.select(editor, _slateSelection)
      ReactEditor.focus(editor)
    })
  }

  // dispatch modal
  showModal({
    component: type,
    props: {
      onUpdate,
      refId,
    },
  })
}
