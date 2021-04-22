import { Transforms } from 'slate'
import { ReactEditor } from 'slate-react'
import { stateSelectionToSlateSelection } from './slateUtils'
import { isAtomicInlineType } from './util'

export const showAtomicModal = ({
  editorContext,
  navigationContext,
  editor,
  inlineAtomicData,
}) => {
  // we need navigationContext and editorContext to show the modal
  if (!navigationContext || !editorContext) {
    return
  }
  let refId
  let type
  let offset
  let selection
  const { setContent, state } = editorContext
  const { showModal } = navigationContext
  const index = editorContext.state.selection.anchor.index
  const _entity = editorContext.state.blocks[index]

  if (!inlineAtomicData) {
    refId = _entity._id
    type = _entity.type
  } else {
    refId = inlineAtomicData.refId
    type = inlineAtomicData.type
  }

  // compose modal dismiss callback function
  const onUpdate = (atomic) => {
    // if atomic is saved, update content
    if (atomic) {
      const _selection = state.selection
      setContent({
        selection: _selection,
        operations: [
          {
            index,
            isRefEntity: atomic._id,
            text: atomic.text,
          },
        ],
      })

      // set offset for selection
      offset = atomic.text.textValue.length
    } else {
      offset = _entity.text.textValue.length
    }

    // current block type is atomic, set the focus
    // if atomic is being updated from an atomic inline, reducer will handler the selection
    if (isAtomicInlineType(_entity.type)) {
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
