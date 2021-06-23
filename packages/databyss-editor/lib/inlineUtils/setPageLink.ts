import { ReactEditor } from '@databyss-org/slate-react'
import { Editor as SlateEditor, Transforms, Node } from '@databyss-org/slate'
import { Page } from '../../../databyss-services/interfaces/Page'
import {
  slateRangesToStateRanges,
  slateSelectionToStateSelection,
} from '../slateUtils'

export const setPageLink = ({
  editor,
  suggestion,
  setContent,
}: {
  editor: ReactEditor & SlateEditor
  suggestion?: Page | string
  setContent: Function
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
    ]
  } else {
    _textNode = [
      {
        text: suggestion!.name,
        link: true,
        atomicId: suggestion!._id,
      },
    ]
  }

  Transforms.removeNodes(editor, { at: path })
  Transforms.insertNodes(editor, _textNode!)
  const _currentBlock = editor.children[path[0]]

  const _stateBlock = {
    textValue: Node.string(_currentBlock),
    ranges: slateRangesToStateRanges(_currentBlock),
  }

  const selection = slateSelectionToStateSelection(editor)

  setContent({
    selection,
    operations: [
      {
        index: path[0],
        text: _stateBlock,
      },
    ],
  })
}
