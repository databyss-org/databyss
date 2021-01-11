import { uid } from '@databyss-org/data/lib/uid'
import { DocumentType } from '@databyss-org/data/database/interfaces'
import { Page, BlockType } from '../interfaces'

export const newPage = (): Page => ({
  _id: uid(),
  name: 'untitled',
  archive: false,

  selection: {
    _id: uid(),
    $type: DocumentType.Selection,
    focus: {
      offset: 0,
      index: 0,
    },
    anchor: {
      offset: 0,
      index: 0,
    },
  },
  blocks: [
    {
      _id: uid(),
      type: BlockType.Entry,
      text: { textValue: '', ranges: [] },
    },
  ],
})
