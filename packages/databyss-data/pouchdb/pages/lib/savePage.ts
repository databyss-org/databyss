import { Page } from '@databyss-org/services/interfaces'
import { DocumentType } from '../../interfaces'
import { upsertImmediate as upsertAsync } from '../../utils'
import { normalizePage } from '../util'

export const savePage = async (data: Page) => {
  await upsertAsync({
    $type: DocumentType.Selection,
    _id: data.selection._id!,
    doc: data.selection,
  })
  await upsertAsync({
    $type: DocumentType.Block,
    _id: data.blocks[0]._id,
    doc: { ...data.blocks[0] },
  })
  await upsertAsync({
    $type: DocumentType.Page,
    _id: data._id,
    doc: normalizePage(data),
  })
}

export default savePage
