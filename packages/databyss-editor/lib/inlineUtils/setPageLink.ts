import { ReactEditor } from '@databyss-org/slate-react'
import { Editor as SlateEditor, Transforms, Node } from '@databyss-org/slate'
import { Embed } from '@databyss-org/services/interfaces'
import { EditorState } from '../../interfaces/EditorState'

import {
  slateSelectionToStateSelection,
  stateSelectionToSlateSelection,
  toggleMark,
} from '../slateUtils'
import { IframeAttributes } from '../../components/Suggest/iframeUtils'
import { Page } from '../../../databyss-services/interfaces/Page'
import { getTextOffsetWithRange } from '../../state/util'
import { RangeType } from '../../../databyss-services/interfaces/Range'

export const setPageLink = ({
  editor,
  state,
  setContent,
  suggestion,
}: {
  editor: ReactEditor & SlateEditor
  state: EditorState
  setContent: Function
  suggestion?: Page
}) => {
  if (!editor?.selection) {
    return
  }

  // remove node
  const _currentLeaf = Node.leaf(editor, editor.selection.focus.path)

  Transforms.removeNodes(editor, {
    match: (node) => node === _currentLeaf,
  })

  // node to insert
  const _textNode = {
    text: suggestion!.name,
    link: true,
    atomicId: suggestion!._id,
  }

  Transforms.insertNodes(editor, _textNode)
  const _activeMarks = SlateEditor.marks(editor)
  if (_activeMarks) {
    Object.keys(_activeMarks).forEach((m) => {
      toggleMark(editor, 'link')
    })
  }
  Transforms.insertNodes(editor, { text: ' ' })
}
