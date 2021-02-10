import { PatchBatch } from '@databyss-org/services/interfaces/Patch'
import { PageDoc, DocumentType } from '../../interfaces'
import { runPatches } from '../util'
import { upsert, findOne } from '../../utils'

// TODO: WRAP THIS IN ERROR HANDLER
const savePatchBatch = async (data: PatchBatch) => {
  const { patches } = data
  // const _page: PageDoc = await findOne({
  //   $type: DocumentType.Page,
  //   query: { _id: id },
  //   useIndex: 'fetch-one',
  // })
  if (!patches) {
    return
  }
  for (const patch of patches) {
    runPatches(patch)
  }
  // save page
  // upsert({ $type: DocumentType.Page, _id: _page._id, doc: _page })
}

export default savePatchBatch
