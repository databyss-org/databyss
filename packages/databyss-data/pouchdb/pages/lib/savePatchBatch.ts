import { PatchBatch } from '@databyss-org/services/interfaces/Patch'
import { PageDoc, DocumentType } from '../../interfaces'
import { runPatches } from '../util'
import { upsert, findOne } from '../../utils'

// TODO: WRAP THIS IN ERROR HANDLER
const savePatchBatch = async (data: PatchBatch) => {
  const { patches, id } = data
  const _page: PageDoc = await findOne(DocumentType.Page, { _id: id })
  if (!patches) {
    return
  }
  for (const patch of patches) {
    await runPatches(patch, _page)
  }
  // save page
  await upsert({ $type: DocumentType.Page, _id: _page._id, doc: _page })
}

export default savePatchBatch
