import { BlockRelation, BlockType } from '@databyss-org/services/interfaces'
import { BlockRelationOperation } from '@databyss-org/editor/interfaces'
import { getDocument, upsert } from '../../utils'
import { DocumentType, PageDoc } from '../../interfaces'
import {
  removeGroupsFromDocument,
  addGroupToDocument,
  addGroupToDocumentsInPage,
} from '../../groups/index'

const setBlockRelations = async (payload: {
  _id: string
  type: BlockType
  page: string
  operationType: BlockRelationOperation
}) => {
  const { _id, page, operationType, type } = payload

  let sharedWithGroups: string[] = []
  // get page to see if page is shared by a group
  const _pageRes = await getDocument<PageDoc>(page)
  if (_pageRes?.sharedWithGroups) {
    sharedWithGroups = _pageRes.sharedWithGroups
  }
  // find relation type
  const _relationId = `r_${_id}`

  const _payload: BlockRelation = {
    _id: _relationId,
    blockId: _id,
    blockType: type,
    pages: [],
  }

  console.log('[setBlockRelations]', operationType, _payload)

  const res = await getDocument<BlockRelation>(_relationId)

  // if no relation exists for atomic, create one
  if (!res) {
    if (operationType === BlockRelationOperation.REMOVE) {
      // bail early if no relation exists
      return
    }

    // create new block relation
    _payload.pages = [page]

    // if page is shared, append to block relation `sharedWithGroups`
    await addGroupToDocument(sharedWithGroups, {
      ..._payload,
      doctype: DocumentType.BlockRelation,
    })

    upsert({
      doctype: DocumentType.BlockRelation,
      _id: _relationId,
      doc: _payload,
    })
  } else {
    // remove page from pages array
    if (operationType === BlockRelationOperation.REMOVE) {
      _payload.pages = res.pages.filter((p) => p !== page)
      // keep up to date with page
      if (res.sharedWithGroups) {
        const _groupsToRemove = await groupsNotSharedByPages({
          sharedWithGroups: res.sharedWithGroups,
          pages: _payload.pages,
        })
        console.log('[setBlockRelations] groupsToRemove', _groupsToRemove)
        await removeGroupsFromDocument(_groupsToRemove, res)
      }

      upsert({
        doctype: DocumentType.BlockRelation,
        _id: _relationId,
        doc: _payload,
      })
      return
    }
    // append page to pages if not already in data
    if (res.pages.find((p) => p === page)) {
      return
    }
    const _pages = res.pages
    _pages.push(page)
    _payload.pages = _pages

    // add sharedWithGroups property to block relations
    await addGroupToDocument(sharedWithGroups, {
      ..._payload,
      doctype: DocumentType.BlockRelation,
    })

    upsert({
      doctype: DocumentType.BlockRelation,
      _id: _relationId,
      doc: _payload,
    })
  }

  // update blocks in page, allow time for page to be updated
  if (operationType === BlockRelationOperation.ADD && _pageRes) {
    setTimeout(() => {
      addGroupToDocumentsInPage(_pageRes)
    }, 3000)
  }
}

async function groupsNotSharedByPages({
  sharedWithGroups,
  pages,
}: {
  sharedWithGroups: string[]
  pages: string[]
}): Promise<string[]> {
  console.log('[groupsNotShareByPages]', sharedWithGroups, pages)
  let _groups = [...sharedWithGroups]
  for (const _groupId of sharedWithGroups) {
    for (const _pageId of pages) {
      const _pageRes = await getDocument(_pageId)
      if (_pageRes?.sharedWithGroups?.includes(_groupId)) {
        // remove group from list because it appeared on another page
        _groups = _groups.filter((_id) => _id !== _groupId)
        break
      }
      // not shared on this page, keep looking
    }
  }
  return _groups
}

export default setBlockRelations
