import { ReactEditor } from '@databyss-org/slate-react'
import { KeyboardEvent } from 'react'
import { isCharacterKeyPress, isMarkActive, toggleMark } from '../slateUtils'
import { InlineTypes } from '../../../databyss-services/interfaces/Range'

export const preventInlineAtomicCharacters = (
  editor: ReactEditor,
  event: KeyboardEvent
) => {
  const marksToPrevent = [
    InlineTypes.InlineSource,
    InlineTypes.InlineTopic,
    InlineTypes.Embed,
  ]

  if (isCharacterKeyPress(event)) {
    marksToPrevent.forEach((m) => {
      if (isMarkActive(editor, m)) {
        toggleMark(editor, m)
      }
    })
  }
}
