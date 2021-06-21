import { ReactEditor } from '@databyss-org/slate-react'
import { Editor as SlateEditor, Transforms, Node } from '@databyss-org/slate'
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

  const { path } = editor.selection.anchor

  let _textNode: Node[] | null

  if (typeof suggestion === 'string') {
    _textNode = [
      {
        text: suggestion,
        link: true,
        atomicId: suggestion,
      },
      {
        text: ' ',
      },
    ]
  } else {
    _textNode = [
      {
        text: suggestion!.name,
        link: true,
        atomicId: suggestion!._id,
      },
      {
        text: ' ',
      },
    ]
  }

  Transforms.insertNodes(editor, _textNode)
  Transforms.removeNodes(editor, { at: path })
  Transforms.move(editor, { distance: 1 })
}
