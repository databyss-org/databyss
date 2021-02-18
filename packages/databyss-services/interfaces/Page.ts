import { uid } from '@databyss-org/data/lib/uid'
import { BlockType, Document } from '@databyss-org/services/interfaces'
import { Block, Selection } from './'

export interface PageHeader extends Document {
  _id: string
  name: string
  archive?: boolean
}

export class Page implements PageHeader {
  _id: string
  selection: Selection
  blocks: Block[]
  name: string
  archive?: boolean
  constructor(id?: string) {
    const _selectionId = uid()
    const _firstBlockId = uid()
    this._id = id || uid()
    this.selection = {
      anchor: {
        index: 0,
        offset: 0,
      },
      focus: {
        index: 0,
        offset: 0,
      },
      _id: _selectionId,
    }
    this.name = 'untitled'
    this.archive = false
    this.blocks = [
      {
        _id: _firstBlockId,
        type: BlockType.Entry,
        text: { textValue: '', ranges: [] },
      },
    ]
  }
}
