import { Group } from '@databyss-org/services/interfaces/Group'
import { httpPost } from '@databyss-org/services/lib/requestApi'
import { DocumentType, PageDoc } from '../interfaces'
import { upsertImmediate, findOne, upsert } from '../utils'
import { Block } from '../../../databyss-services/interfaces/Block'
import { setPouchSecret } from '@databyss-org/services/session/clientStorage'
import { getAtomicClosureText } from '../../../databyss-services/blocks/index'
import { selectAllSelection } from '@databyss-org/editor/state/util'
import {
  getAtomicsFromSelection,
  getAtomicsFromFrag,
} from '../../../databyss-editor/lib/clipboardUtils/getAtomicsFromSelection'

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

const addGroupToDocument = (groupId: string, document: any) => {
  // add groupId to page array
  const _sharedWithGroups = document.sharedWithGroups || []

  document.sharedWithGroups = removeDuplicatesFromArray(
    _sharedWithGroups.concat(groupId)
  )
  // add group to page document
  upsert({
    $type: document.$type,
    _id: document._id,
    doc: document,
  })
}

// TODO: this function should use react-query. where should this function go to have access to the hooks?

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
  if (_page) {
    const _blocks: Block[] = []

    // add groupId to page array
    addGroupToDocument(groupId, _page)

    // add to all blocks associated with page
    for (const [i, _b] of _page.blocks.entries()) {
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
          addGroupToDocument(groupId, _block)
        }
        _blocks[i] = _populatedBlock
      }
    }

    // add to selection
    const _selectionId = _page.selection
    const _selection = await findOne<any>({
      $type: DocumentType.Selection,
      query: { _id: _selectionId },
    })
    if (_selection) {
      addGroupToDocument(groupId, _selection)
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
        addGroupToDocument(groupId, _atomic)
      }
    }
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
