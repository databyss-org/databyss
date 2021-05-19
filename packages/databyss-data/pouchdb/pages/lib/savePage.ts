import { Page } from '@databyss-org/services/interfaces'
import { DocumentType } from '../../interfaces'
import { upsertImmediate } from '../../utils'
import { normalizePage } from '../util'

export const savePage = async (data: Page) => {
  await upsertImmediate({
    doctype: DocumentType.Selection,
    _id: data.selection._id,
    doc: data.selection,
  })
  await upsertImmediate({
    doctype: DocumentType.Block,
    _id: data.blocks[0]._id,
    doc: { ...data.blocks[0] },
  })
  await upsertImmediate({
    doctype: DocumentType.Block,
    _id: data.blocks[1]._id,
    doc: { ...data.blocks[1] },
  })
  await upsertImmediate({
    doctype: DocumentType.Page,
    _id: data._id,
    doc: normalizePage(data),
  })
}

export default savePage
