import { db } from './db'
import { Page } from '@databyss-org/services/interfaces'
import { DocumentType, DbPage } from './interfaces'
import { PatchBatch } from '../interfaces/Patch'
import { runPatches } from './patches'

export const populatePage = async (_id: string): Promise<Page | null> => {
  const _response = await db.find({
    selector: {
      documentType: 'PAGE',
      _id,
    },
  })
  console.log('POPULATE RESPONSE', JSON.parse(JSON.stringify(_response)))
  if (_response.docs.length) {
    const _page: Page = _response.docs[0]
    const _blocks = await Promise.all(
      _page.blocks.map(async (data) => {
        const _response = await db.find({
          selector: {
            documentType: DocumentType.Block,
            _id: data._id,
          },
        })
        return _response.docs[0]
      })
    )
    _page.blocks = _blocks
    return _page
  }
  return null
}

export const savePatchData = async (data: PatchBatch) => {
  const { patches, id } = data
  const _page: DbPage = await db.get(id)
  if (!patches) {
    return
  }
  for (const patch of patches) {
    await runPatches(patch, _page)
  }
  //   await req.page.save()
}
