import { Group } from '@databyss-org/services/interfaces/Group'
import _ from 'lodash'
import { httpPost } from '@databyss-org/services/lib/requestApi'
import {
  setPouchSecret,
  deletePouchSecret,
  getPouchSecret,
} from '@databyss-org/services/session/clientStorage'
import { DocumentType, PageDoc } from '../interfaces'
import { upsertImmediate, findOne, findAll } from '../utils'
import { Block } from '../../../databyss-services/interfaces/Block'
import { getAtomicClosureText } from '../../../databyss-services/blocks/index'
import { getAtomicsFromFrag } from '../../../databyss-editor/lib/clipboardUtils/getAtomicsFromSelection'
import { dbRef, REMOTE_CLOUDANT_URL } from '../db'
import { isAtomicInlineType } from '../../../databyss-editor/lib/util'
import { Page } from '../../../databyss-services/interfaces/Page'
import {
  createDatabaseCredentials,
  validateGroupCredentials,
} from '../../../databyss-services/editorPage/index'

const removeDuplicatesFromArray = (array: string[]) =>
  array.filter((v, i, a) => a.indexOf(v) === i)

export const removeIdsFromSharedDb = ({
  ids,
  groupId,
}: {
  ids: string[]
  groupId: string
}) =>
  httpPost(`/cloudant/groups/delete`, {
    // TODO: this should not have to be turned to lowercase
    data: { ids, groupId },
  })

/*
  creates or removes a cloudant group database if no database exists
  */

export const addOrRemoveCloudantGroupDatabase = async ({
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
  // if is public, add credentials to localstorage
  if (isPublic) {
    setPouchSecret(Object.values(res.data))
  } else {
    deletePouchSecret(groupId)
  }
}

export const addGroupToDocument = async (groupIds: string[], document: any) => {
  // add groupId to page array
  let _sharedWithGroups = document.sharedWithGroups || []
  _sharedWithGroups = removeDuplicatesFromArray([
    ..._sharedWithGroups,
    ...groupIds,
  ])
  // update if ids were added

  if (
    !_.isEqual(document?.sharedWithGroups?.sort(), _sharedWithGroups?.sort())
  ) {
    document.sharedWithGroups = _sharedWithGroups
    // add group to page document
    await upsertImmediate({
      doctype: document.doctype,
      _id: document._id,
      doc: document,
    })
  }
}

export const removeGroupsFromDocument = async (
  groupIds: string[],
  document: any
) => {
  // if property doenst exist, bail early
  if (!document?.sharedWithGroups?.length) {
    return
  }

  // remove groupIds from sharedWithGroups
  const _sharedWithGroups = document.sharedWithGroups.filter(
    (g) => !groupIds.includes(g)
  )

  // if elements were removed, update document
  if (document.sharedWithGroups.length !== _sharedWithGroups.length) {
    document.sharedWithGroups = _sharedWithGroups

    await upsertImmediate({
      doctype: document.doctype,
      _id: document._id,
      doc: document,
    })
  }
}

export const addGroupToDocumentsFromPage = async (page: PageDoc) => {
  const _page = page

  const _sharedWithPages = _page.sharedWithGroups || []

  // if page is not shared, bail from function
  if (!_sharedWithPages.length) {
    return
  }

  const _blocks: Block[] = []

  // add to all blocks associated with page
  for (const [i, _b] of _page.blocks.entries()) {
    const _block = await findOne<Block>({
      doctype: DocumentType.Block,
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
        await addGroupToDocument(_sharedWithPages, _block)
      }
      _blocks[i] = _populatedBlock
    }
  }

  // add to selection
  const _selectionId = _page.selection
  const _selection = await findOne<any>({
    doctype: DocumentType.Selection,
    query: { _id: _selectionId },
  })
  if (_selection) {
    await addGroupToDocument(_sharedWithPages, _selection)
  }

  // get all atomics associated with page
  const _atomics = getAtomicsFromFrag(_blocks)
  // add groupId to all atomics in pouch

  for (const _a of _atomics) {
    // add sharedToGroup to inline atomics
    const _atomic = await findOne<any>({
      doctype: DocumentType.Block,
      query: { _id: _a._id },
    })
    if (_atomic) {
      await addGroupToDocument(_sharedWithPages, _atomic)
    }

    const _blockRelation = await findOne<any>({
      doctype: DocumentType.BlockRelation,
      query: { _id: `r_${_a._id}` },
    })
    if (_blockRelation) {
      await addGroupToDocument(_sharedWithPages, _blockRelation)
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
    doctype: DocumentType.Page,
    query: { _id: pageId },
  })
  if (_page && !_page?.sharedWithGroups?.includes(groupId)) {
    // add groupId to page array if does not already exist
    await addGroupToDocument([groupId], _page)
  }
}

const upsertReplication = ({
  groupId,
  dbKey,
  dbPassword,
}: {
  groupId: string
  dbKey: string
  dbPassword: string
}) => {
  const opts = {
    retry: true,
    auth: {
      username: dbKey,
      password: dbPassword,
    },
  }

  // upsert replication
  dbRef.current!.replicate.to(`${REMOTE_CLOUDANT_URL}/${groupId}`, {
    ...opts,
    // do not replciate design docs or documents that dont include the page
    filter: (doc) => {
      if (!doc?.sharedWithGroups) {
        return false
      }
      const _isSharedWithGroup = doc?.sharedWithGroups.includes(groupId)
      if (!_isSharedWithGroup) {
        return false
      }
      return !doc._id.includes('design/')
    },
  })
}

/**
 * one time replication to upsert a @groupId to remote DB
 */
export const replicateGroup = async ({
  groupId,
  isPublic,
}: {
  groupId: string
  isPublic?: boolean
}) => {
  try {
    // first check if credentials exist
    let dbSecretCache = getPouchSecret() || {}
    let creds = dbSecretCache[groupId.substr(2)]
    if (!creds) {
      // credentials are not in local storage
      // creates new user credentials and adds them to local storage
      await createDatabaseCredentials({
        groupId,
        isPublic,
      })

      // credentials should be in local storage now
      dbSecretCache = getPouchSecret()
      creds = dbSecretCache[groupId.substr(2)]
      if (!creds) {
        // user is not authorized
        return
      }
    }
    // confirm credentials work
    await validateGroupCredentials({
      groupId,
      dbKey: creds.dbKey,
    })

    upsertReplication({
      groupId,
      dbKey: creds.dbKey,
      dbPassword: creds.dbPassword,
    })
  } catch (err) {
    console.error(err)
  }
}

export const setGroup = async (group: Group, pageId?: string) => {
  // if pageId is passed, crawl pageId and append group id to all documents associated with the page
  if (pageId) {
    addPageToGroup({ pageId, groupId: group._id })
  }

  // prevent duplicates
  group.pages = removeDuplicatesFromArray(group.pages)

  // append property in order for replicated group to get group metadata
  await addGroupToDocument([`g_${group._id}`], {
    ...group,
    doctype: DocumentType.Group,
  })

  await upsertImmediate({
    doctype: DocumentType.Group,
    _id: group._id,
    doc: group,
  })

  // if group settings were changed, propegate changes to remote db
  if (group.public) {
    replicateGroup({
      groupId: `g_${group._id}`,
      isPublic: true,
    })
  }
}

/*
removes given groupId from any document associated with pageId
*/

export const removeGroupFromPage = async ({
  pageId,
  groupId,
}: {
  pageId: string
  groupId: string
}) => {
  const _page = await findOne<PageDoc>({
    doctype: DocumentType.Page,
    query: { _id: pageId },
  })

  if (_page?.sharedWithGroups) {
    // removes groupId from sharedWithGroups array
    await removeGroupsFromDocument([groupId], _page)

    const _blocks: Block[] = []

    // add to all blocks associated with page
    for (const [i, _b] of _page.blocks.entries()) {
      const _block = await findOne<Block>({
        doctype: DocumentType.Block,
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
          await removeGroupsFromDocument([groupId], _block)
        }
        _blocks[i] = _populatedBlock
      }
    }

    // remove from selection
    const _selectionId = _page.selection
    const _selection = await findOne<any>({
      doctype: DocumentType.Selection,
      query: { _id: _selectionId },
    })
    if (_selection.sharedWithPages) {
      await removeGroupsFromDocument([groupId], _selection)
    }

    // get all atomics associated with page
    const _atomics = getAtomicsFromFrag(_blocks)
    // add groupId to all atomics in pouch

    for (const _a of _atomics) {
      const _atomic = await findOne<any>({
        doctype: DocumentType.BlockRelation,
        query: { _id: `r_${_a._id}` },
      })
      if (_atomic) {
        await removeGroupsFromDocument([groupId], _atomic)
      }
    }
  }
}

export const setPublicPage = async (pageId: string, bool: boolean) => {
  const _data: Group = {
    _id: `p_${pageId}`,
    pages: [pageId],
    public: bool,
  }

  // if page is shared
  if (bool) {
    // add groupId to pages sharedWithPages array
    // this will kick off `pageDepencencyObserver` which will add the group id to all page document
    await addPageToGroup({ pageId, groupId: _data._id })

    // append property in order for replicated group to get group metadata
    await addGroupToDocument([_data._id], {
      ..._data,
      doctype: DocumentType.Group,
    })

    await upsertImmediate({
      doctype: DocumentType.Group,
      _id: _data._id,
      doc: _data,
    })

    // create cloudant db
    await addOrRemoveCloudantGroupDatabase({
      groupId: _data._id,
      isPublic: true,
    })
  } else {
    // if page is removed from sharing

    // delete group from pouchDb

    await upsertImmediate({
      doctype: DocumentType.Group,
      _id: _data._id,
      doc: { ..._data, _deleted: true },
    })

    // crawl page and remove groupId from documents
    await removeGroupFromPage({ pageId, groupId: _data._id })

    // remove database from cloudant
    await addOrRemoveCloudantGroupDatabase({
      groupId: _data._id,
      isPublic: false,
    })
  }
}

/**
 * one time replication to upsert a group to remote DB
 */
// TODO: handle offline with a queue of pending one-off replications when the main replication
//   stream is back online
export const replicateSharedPage = async (pageIds: string[]) => {
  // get all public groups which include page
  const _groups = await findAll({
    doctype: DocumentType.Group,
    query: {
      pages: {
        $elemMatch: { $in: pageIds },
      },
      // TODO: this wont always be true when we have collaborative collections
      public: true,
    },
  })
  if (_groups?.length) {
    for (const group of _groups) {
      replicateGroup({ groupId: group._id, isPublic: group.public })
    }
  }
}

export const updateAndReplicateSharedDatabase = async ({
  groupId,
  isPublic,
}: {
  groupId: string
  isPublic: boolean
}) => {
  // create or delete a database

  await addOrRemoveCloudantGroupDatabase({
    groupId: `g_${groupId}`,
    isPublic,
  })

  if (isPublic) {
    replicateGroup({
      groupId: `g_${groupId}`,
      isPublic: true,
    })
  }
}

/**
 * crawl page and add group to all associated documents
 */
export const addPageDocumentToGroup = async ({
  pageId,
  group,
}: {
  group: Group
  pageId: string
}) => {
  // add groupId to page document
  await addPageToGroup({ pageId, groupId: `g_${group._id}` })
  // get updated pageDoc
  const _page: PageDoc | null = await findOne({
    doctype: DocumentType.Page,
    query: { _id: pageId },
  })
  if (_page) {
    // add propagate sharedWithGroups property to all documents
    await addGroupToDocumentsFromPage(_page)
    // get group shared status
    const { _id: groupId, public: isPublic } = group
    // one time upsert to remote db
    if (isPublic) {
      replicateGroup({ groupId: `g_${groupId}`, isPublic })
    }
  }
}

/**
 * resets a sharedDB if page was removed
 */
export const removePageFromGroup = async ({
  page,
  group,
}: {
  page: PageDoc | Page
  group: Group
}) => {
  // compose list of id's that need deleting

  // TODO: this should check for atomics as well
  const _ids = [page._id]
  page.blocks.forEach((b) => {
    if (!isAtomicInlineType(b.type)) {
      _ids.push(b._id)
    }
  })
  await removeIdsFromSharedDb({
    ids: _ids,
    groupId: group._id,
  })

  const { public: isPublic, _id: groupId } = group
  // remove group from all documents associated with pageId
  await removeGroupFromPage({ pageId: page._id, groupId: `g_${group._id}` })

  if (isPublic) {
    replicateGroup({
      groupId: `g_${groupId}`,
      isPublic: true,
    })
  }
}

/**
 * deletes a collection
 */
export const deleteCollection = async (groupId: string) => {
  // first remove the group from all associated documents
  const _group: Group | null = await findOne({
    doctype: DocumentType.Group,
    query: { _id: groupId },
  })
  if (_group) {
    const { public: isPublic, _id: groupId } = _group

    // get all pages group is associated with
    const _pageIds = _group.pages
    for (const pageId of _pageIds) {
      // remove group from all documents associated with pageId
      await removeGroupFromPage({ pageId, groupId: `g_${groupId}` })
    }

    // delete group locally
    await upsertImmediate({
      doctype: DocumentType.Group,
      _id: groupId,
      doc: { ..._group, _deleted: true },
    })

    if (isPublic) {
      // TODO: this needs to be merged with the current offline group PR
      // delete group from cloudant
      updateAndReplicateSharedDatabase({
        groupId,
        isPublic: false,
      })
    }
  }
}
