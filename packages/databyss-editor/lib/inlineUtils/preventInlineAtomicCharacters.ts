import { ReactEditor } from '@databyss-org/slate-react'
import { KeyboardEvent } from 'react'
import { isCharacterKeyPress, isMarkActive, toggleMark } from '../slateUtils'
import { InlineTypes } from '../../../databyss-services/interfaces/Range'

export const preventInlineAtomicCharacters = (
  editor: ReactEditor,
  event: KeyboardEvent
) => {
  if (
    isCharacterKeyPress(event) &&
    isMarkActive(editor, InlineTypes.InlineTopic)
  ) {
    toggleMark(editor, InlineTypes.InlineTopic)
  }

  if (
    isCharacterKeyPress(event) &&
    isMarkActive(editor, InlineTypes.InlineSource)
  ) {
    toggleMark(editor, InlineTypes.InlineSource)
  }
}
