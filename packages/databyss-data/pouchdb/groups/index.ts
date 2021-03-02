import { Group } from '@databyss-org/services/interfaces/Group'
import { httpPost } from '@databyss-org/services/lib/requestApi'
import { DocumentType, PageDoc } from '../interfaces'
import { upsertImmediate, findOne, upsert } from '../utils'
import { Block } from '../../../databyss-services/interfaces/Block'

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
  await httpPost(`/cloudant/groups`, {
    // TODO: this should not have to be turned to lowercase
    data: { groupId, isPublic },
  })
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
    // add groupId to page array
    addGroupToDocument(groupId, _page)

    // add to all blocks associated with page
    for (const _b of _page.blocks) {
      const _block = await findOne<Block>({
        $type: DocumentType.Block,
        query: { _id: _b._id },
      })
      if (_block) {
        addGroupToDocument(groupId, _block)
      }
    }

    // add to selection
    const _selectionId = _page.selection
    const _selection = await findOne<PageDoc>({
      $type: DocumentType.Selection,
      query: { _id: _selectionId },
    })
    if (_selection) {
      addGroupToDocument(groupId, _selection)
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
  await createCloudantGroupDatabase({ groupId: _data._id, isPublic: true })
}
