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
  isPage,
}: {
  editor: ReactEditor & SlateEditor
  suggestion?: Page | string
  setContent: Function
  isPage?: boolean
}) => {
  if (!editor?.selection) {
    return
  }

  const { path } = editor.selection.anchor

  let _textNode: Node | null

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

  let isRoot = false
  // edge case: if node is first node on block handle seperately
  if (!path?.[1]) {
    isRoot = true
  }

  Transforms.removeNodes(editor, { at: path })
  if (isRoot) {
    Transforms.insertNodes(editor, _textNode!, { at: path })
    Transforms.move(editor, { distance: _textNode.text.length + 1 })
  } else {
    Transforms.insertNodes(editor, _textNode!)
  }
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
        checkAtomicDelta: true,
      },
    ],
  })
}

export const convertSelectionToLink = ({
  editor,
  link,
}: {
  editor: ReactEditor & SlateEditor
  link: string
}) => {
  if (!editor.selection) {
    return
  }
  SlateEditor.addMark(editor, 'link', true)
  SlateEditor.addMark(editor, 'atomicId', link)
}
