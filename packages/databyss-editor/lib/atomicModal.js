import { Transforms } from '@databyss-org/slate'
import { ReactEditor } from '@databyss-org/slate-react'
import { stateSelectionToSlateSelection } from './slateUtils'
import { isAtomicInlineType } from './util'

export const showAtomicModal = ({
  editorContext,
  navigationContext,
  editor,
  inlineAtomicData,
  index,
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
  const _index = index.current || editorContext.state.selection.anchor.index

  console.log(_index)

  const _entity = editorContext.state.blocks[_index]

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
      console.log('INDEX', index)
      console.log('STATE', editorContext.state.selection.anchor.index)
      console.log('INDEX IN SET CONTENT', _index)
      setContent({
        selection: _selection,
        operations: [
          {
            index: _index,
            isRefEntity: { _id: atomic._id, type, shortName: atomic.name },
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
          anchor: { index: _index, offset },
          focus: { index: _index, offset },
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
