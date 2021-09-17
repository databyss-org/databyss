import { uid, uidlc } from '@databyss-org/data/lib/uid'
import { BlockType, Document } from '@databyss-org/services/interfaces'
import { Block, Selection } from './'

export const UNTITLED_PAGE_NAME = 'untitled'

export interface PageHeader extends Document {
  _id: string
  name: string
  archive?: boolean
}

export interface PageConstructorOptions {
  skipTitleBlock?: boolean
}

export class Page implements PageHeader {
  _id: string
  selection: Selection
  blocks: Block[]
  name: string
  archive?: boolean
  lastSequence?: number
  constructor(id?: string, options?: PageConstructorOptions) {
    this._id = id || uidlc()
    this.selection = {
      anchor: {
        index: 0,
        offset: 0,
      },
      focus: {
        index: 0,
        offset: 0,
      },
      _id: uid(),
    }
    this.name = UNTITLED_PAGE_NAME
    this.archive = false
    this.blocks = [
      {
        _id: uid(),
        type: BlockType.Entry,
        text: { textValue: '', ranges: [] },
      },
    ]
    if (!options?.skipTitleBlock) {
      this.blocks.push({
        _id: uid(),
        type: BlockType.Entry,
        text: { textValue: '', ranges: [] },
      })
    }
  }
}
