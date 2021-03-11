import { BlockRelation, BlockType } from '@databyss-org/services/interfaces'
import { BlockRelationOperation } from '@databyss-org/editor/interfaces'
import { getDocument, upsert } from '../../utils'
import { DocumentType, PageDoc } from '../../interfaces'
import {
  removeGroupsFromDocument,
  addGroupToDocument,
  addGroupToDocumentsFromPage,
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
      if (_payload?.sharedWithGroups) {
        // TODO: this only works with single page share logic
        await removeGroupsFromDocument([`p_${page}`], _payload)
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
    await addGroupToDocument(sharedWithGroups, _payload)

    upsert({
      doctype: DocumentType.BlockRelation,
      _id: _relationId,
      doc: _payload,
    })
  }

  // update blocks in page, allow time for page to be updated
  if (operationType === BlockRelationOperation.ADD && _pageRes) {
    setTimeout(() => {
      addGroupToDocumentsFromPage(_pageRes)
    }, 3000)
  }
}

export default setBlockRelations
