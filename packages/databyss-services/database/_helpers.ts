import { Page } from '@databyss-org/services/interfaces'
import { getDefaultPageId } from '@databyss-org/services/session/clientStorage'

import { db } from './db'
import { PatchBatch } from '../interfaces/Patch'
import { DocumentType, MangoResponse, Block } from './interfaces'
import { PageHeader } from '../interfaces/Page'
import { initSelection, initBlock, initPage } from './initialState'
import { Selection } from '../interfaces/Selection'

export const populatePage = async (_id: string): Promise<Page | null> => {
  const _response = await db.find({
    selector: {
      documentType: DocumentType.Page,
      _id,
    },
  })
  if (_response.docs.length) {
    const _page: Page = _response.docs[0]

    // populate selection
    if (_page.selection) {
      //  await db.upsert(_page.selection._id, ()=> {

      //   })
      const _selection: Selection = await db.get(_page.selection)

      _page.selection = _selection
    }

    const _blocks: Block[] = await Promise.all(
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

// export const savePatchData = async (data: PatchBatch) => {
//   const { patches, id } = data
//   const _page: DbPage = await db.get(id)
//   if (!patches) {
//     return
//   }
//   for (const patch of patches) {
//     await runPatches(patch, _page)
//   }
//   // save page
//   await db.upsert(_page._id, () => _page)
// }

export const initNewPage = async () => {
  // ADD SELECTION DOCUMENT
  await db.upsert(initSelection._id, () => initSelection)

  // ADD BLOCK DOCUMENT
  const _id = getDefaultPageId()
  const _page = initPage(_id)
  await db.upsert(_id, () => _page)

  // ADD PAGE DOCUMENT
  await db.upsert(initBlock._id, () => initBlock)
}

export const fetchAllPages = async (): Promise<MangoResponse<PageHeader>> => {
  let _pages: MangoResponse<PageHeader> = await db.find({
    selector: {
      documentType: 'PAGE',
    },
  })
  if (!_pages.docs.length) {
    // initiate pages
    await initNewPage()
    _pages = await db.find({
      selector: {
        documentType: 'PAGE',
      },
    })
  }
  return _pages
}
