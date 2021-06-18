import { ReactEditor } from '@databyss-org/slate-react'
import {
  Editor as SlateEditor,
  Transforms,
  Node,
  Text,
} from '@databyss-org/slate'
import { toggleMark } from '../slateUtils'
import { Page } from '../../../databyss-services/interfaces/Page'

export const setPageLink = ({
  editor,
  suggestion,
}: {
  editor: ReactEditor & SlateEditor
  suggestion?: Page | string
}) => {
  if (!editor?.selection) {
    return
  }

  // remove node
  const _currentLeaf = Node.leaf(editor, editor.selection.focus.path)

  Transforms.removeNodes(editor, {
    match: (node) => node === _currentLeaf,
  })

  let _textNode: Text | null

  if (typeof suggestion === 'string') {
    _textNode = {
      text: suggestion,
      link: true,
      atomicId: suggestion,
    }
  } else {
    _textNode = {
      text: suggestion!.name,
      link: true,
      atomicId: suggestion!._id,
    }
  }

  Transforms.insertNodes(editor, _textNode)
  const _activeMarks = SlateEditor.marks(editor)
  // turn off mark
  if (_activeMarks) {
    toggleMark(editor, 'link')
  }
  // insert space
  Transforms.insertNodes(editor, { text: ' ' })
}
