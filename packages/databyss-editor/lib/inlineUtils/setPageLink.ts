import { ReactEditor } from '@databyss-org/slate-react'
import { Editor as SlateEditor, Transforms, Node } from '@databyss-org/slate'
import { toggleMark } from '../slateUtils'
import { Page } from '../../../databyss-services/interfaces/Page'

export const setPageLink = ({
  editor,
  suggestion,
}: {
  editor: ReactEditor & SlateEditor
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
    toggleMark(editor, 'link')
  }
  Transforms.insertNodes(editor, { text: ' ' })
}
