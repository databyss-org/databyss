import { Group } from '@databyss-org/services/interfaces/Group'
import { httpPost } from '@databyss-org/services/lib/requestApi'
import { setPouchSecret } from '@databyss-org/services/session/clientStorage'
import { DocumentType, PageDoc } from '../interfaces'
import { upsertImmediate, findOne } from '../utils'
import { Block } from '../../../databyss-services/interfaces/Block'
import { getAtomicClosureText } from '../../../databyss-services/blocks/index'
import { getAtomicsFromFrag } from '../../../databyss-editor/lib/clipboardUtils/getAtomicsFromSelection'

const removeDuplicatesFromArray = (array: string[]) =>
  array.filter((v, i, a) => a.indexOf(v) === i)

/*
  creates a cloudant group database if no database exists
  */

const createCloudantGroupDatabase = async ({
  groupId,
  isPublic,
}: {
  groupId: string
  isPublic: boolean
}) => {
  const res = await httpPost(`/cloudant/groups`, {
    // TODO: this should not have to be turned to lowercase
    data: { groupId, isPublic },
  })
  return res.data
}

const addGroupToDocument = (groupIds: string[], document: any) => {
  // add groupId to page array

  const _sharedWithGroups = document.sharedWithGroups || []
  document.sharedWithGroups = removeDuplicatesFromArray([
    ..._sharedWithGroups,
    ...groupIds,
  ])
  // add group to page document
  upsertImmediate({
    $type: document.$type,
    _id: document._id,
    doc: document,
  })
}

export const addGroupToDocumentsFromPage = async (page: PageDoc) => {
  const _sharedWithPages = page.sharedWithGroups || []
  const _blocks: Block[] = []

  // add to all blocks associated with page
  for (const [i, _b] of page.blocks.entries()) {
    const _block = await findOne<Block>({
      $type: DocumentType.Block,
      query: { _id: _b._id },
    })
    if (_block) {
      const _populatedBlock = { ..._block }

      if (_b.type?.match(/^END_/)) {
        _populatedBlock.type = _b.type
        _populatedBlock.text = {
          textValue: getAtomicClosureText(
            _b.type,
            _populatedBlock.text.textValue
          ),
          ranges: [],
        }
      } else {
        addGroupToDocument(_sharedWithPages, _block)
      }
      _blocks[i] = _populatedBlock
    }
  }

  // add to selection
  const _selectionId = page.selection
  const _selection = await findOne<any>({
    $type: DocumentType.Selection,
    query: { _id: _selectionId },
  })
  if (_selection) {
    addGroupToDocument(_sharedWithPages, _selection)
  }

  // get all atomics associated with page
  const _atomics = getAtomicsFromFrag(_blocks)
  // add groupId to all atomics in pouch

  for (const _a of _atomics) {
    const _atomic = await findOne<any>({
      $type: DocumentType.BlockRelation,
      query: { _id: `r_${_a._id}` },
    })
    if (_atomic) {
      addGroupToDocument(_sharedWithPages, _atomic)
    }
  }
}

/*
crawl page and append groupId to all documents
*/
export const addPageToGroup = async ({
  pageId,
  groupId,
}: {
  pageId: string
  groupId: string
}) => {
  const _page = await findOne<PageDoc>({
    $type: DocumentType.Page,
    query: { _id: pageId },
  })
  if (_page && !_page?.sharedWithGroups?.includes(groupId)) {
    // add groupId to page array if does not already exist
    addGroupToDocument([groupId], _page)
  }
}

export const setGroup = async (group: Group, pageId?: string) => {
  // if pageId is passed, crawl pageId and append group id to all documents associated with the page
  if (pageId) {
    addPageToGroup({ pageId, groupId: group._id })
  }

  // prevent duplicates
  group.pages = removeDuplicatesFromArray(group.pages)

  await upsertImmediate({
    $type: DocumentType.Group,
    _id: group._id,
    doc: { ...group, $type: DocumentType.Group },
  })
}

export const setPublicPage = async (pageId: string, bool: boolean) => {
  const _data: Group = {
    _id: `p_${pageId}`,
    pages: [pageId],
    public: bool,
  }

  // add groupId to pages sharedWithPages array
  // this will kick off `pageDepencencyObserver` which will add the group id to all page document
  await addPageToGroup({ pageId, groupId: _data._id })

  await upsertImmediate({
    $type: DocumentType.Group,
    _id: _data._id,
    doc: _data,
  })

  // create cloudant db
  // returns credentials from public page
  const _credentials = await createCloudantGroupDatabase({
    groupId: _data._id,
    isPublic: true,
  })
  // add credentials to local storage
  setPouchSecret(Object.values(_credentials))
}
