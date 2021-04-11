import { Group } from '@databyss-org/services/interfaces/Group'
import _ from 'lodash'
import { httpDelete, httpPost } from '@databyss-org/services/lib/requestApi'
import {
  setPouchSecret,
  deletePouchSecret,
  getPouchSecret,
} from '@databyss-org/services/session/clientStorage'
import { Selection } from '@databyss-org/services/interfaces'
import { DocumentType, PageDoc } from '../interfaces'
import {
  upsertImmediate,
  findOne,
  findAll,
  getDocument,
  getDocuments,
} from '../utils'
import {
  Block,
  BlockRelation,
  BlockType,
} from '../../../databyss-services/interfaces/Block'
import { getAtomicClosureText } from '../../../databyss-services/blocks/index'
import { getAtomicsFromFrag } from '../../../databyss-editor/lib/clipboardUtils/getAtomicsFromSelection'
import { dbRef, REMOTE_CLOUDANT_URL } from '../db'
import { Page } from '../../../databyss-services/interfaces/Page'
import {
  setGroupAction,
  setGroupPageAction,
  PageAction,
  GroupAction,
  relatedPagesInGroup,
} from './utils'
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
}) => {
  console.log('[removeIdsFromSharedDb]', ids, groupId)
  return httpPost(`/cloudant/groups/${groupId}/remove`, {
    data: { ids, groupId },
  })
}

/**
 * creates a cloudant group database
 */
export const addCloudantGroupDatabase = async ({
  groupId,
  isPublic,
}: {
  groupId: string
  isPublic: boolean
}) => {
  const res = await httpPost(`/cloudant/groups/${groupId}`, {
    data: { isPublic },
  })
  // if is public, add credentials to localstorage
  if (isPublic) {
    setPouchSecret(Object.values(res.data))
  }
}

/**
 * removes a cloudant group database
 */
export const removeCloudantGroupDatabase = async (groupId: string) => {
  await httpDelete(`/cloudant/groups/${groupId}`)
  deletePouchSecret(groupId)
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

    console.log('[removeGroupsFromDocument] upsert', document)
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
    batch_size: 1000,
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
    let creds = dbSecretCache[groupId]
    if (!creds) {
      // credentials are not in local storage
      // creates new user credentials and adds them to local storage
      await createDatabaseCredentials({
        groupId,
        isPublic,
      })

      // credentials should be in local storage now
      dbSecretCache = getPouchSecret()
      creds = dbSecretCache[groupId]
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
  await addGroupToDocument([group._id], {
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
    setGroupAction(group._id, GroupAction.SHARED)
  }
}

/**
 * Removes given groupId from any document associated with pageId
 * @returns an array of document _ids to delete from the shared db on cloudant
 */
export const removeGroupFromPage = async ({
  pageId,
  groupId,
}: {
  pageId: string
  groupId: string
}): Promise<string[]> => {
  const _page = await getDocument<PageDoc>(pageId)

  if (!_page) {
    return []
  }

  const _idsToRemove = [pageId]

  // removes groupId from sharedWithGroups array
  await removeGroupsFromDocument([groupId], _page)

  // remove from selection
  const _selectionId = _page.selection
  const _selection = await getDocument<Selection>(_selectionId)
  await removeGroupsFromDocument([groupId], _selection)
  _idsToRemove.push(_selectionId)

  // get all blocks related to page
  const _pageBlocks = _page.blocks.filter((_pb) => !_pb.type?.match(/^END_/))
  const _blocks = Object.values(
    await getDocuments<Block>(_pageBlocks.map((_pb) => _pb._id))
  ).filter((_b) => !!_b) as Block[]

  // remove from all page entries
  const _entryBlocks = _blocks.filter(
    (_block) => _block.type === BlockType.Entry
  )
  for (const _entry of _entryBlocks) {
    await removeGroupsFromDocument([groupId], _entry)
    _idsToRemove.push(_entry._id)
  }

  // remove from non-entry blocks if they don't appear in other pages in the shared group
  const _relatedBlocks = getAtomicsFromFrag(_blocks)
  const _group = await getDocument<Group>(groupId)

  for (const _relatedBlockRef of _relatedBlocks) {
    const _relation = await getDocument<BlockRelation>(
      `r_${_relatedBlockRef._id}`
    )
    // only remove from related block if it doesn't exist on other pages
    let _relatedPagesInGroup: string[] = []
    if (_relation) {
      _relatedPagesInGroup = relatedPagesInGroup(_group!, _relation)
    }
    if (_relatedPagesInGroup.length > 1) {
      continue
    }
    if (!_relatedPagesInGroup.length || _relatedPagesInGroup[0] === pageId) {
      const _relatedBlock = await getDocument<Block>(_relatedBlockRef._id)
      await removeGroupsFromDocument([groupId], _relatedBlock)
      _idsToRemove.push(_relatedBlockRef._id)
    }
  }

  return _idsToRemove
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
    setGroupAction(_data._id, GroupAction.SHARED)
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
    setGroupAction(_data._id, GroupAction.UNSHARED)
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

export const removeSharedDatabase = (groupId: string) =>
  removeCloudantGroupDatabase(groupId)

export const updateAndReplicateSharedDatabase = async ({
  groupId,
  isPublic,
}: {
  groupId: string
  isPublic: boolean
}) => {
  await addCloudantGroupDatabase({
    groupId,
    isPublic,
  })

  if (isPublic) {
    replicateGroup({
      groupId,
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
  // if this is the first page added to the group, make it default
  group.defaultPageId = pageId
  // add groupId to page document
  await addPageToGroup({ pageId, groupId: group._id })
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
      // push to queue
      setGroupPageAction(groupId, _page._id, PageAction.ADD)
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
  // remove group from all documents associated with pageId
  // compose list of id's that need deleting
  const _ids = await removeGroupFromPage({
    pageId: page._id,
    groupId: group._id,
  })

  await removeIdsFromSharedDb({
    ids: _ids,
    groupId: group._id,
  })

  const { public: isPublic, _id: groupId } = group

  if (isPublic) {
    replicateGroup({
      groupId,
      isPublic: true,
    })
  }
}

export const removeAllGroupsFromPage = async (pageId: string) => {
  console.log('[removeAllGroupsFromPage]')
  const _page = await getDocument<PageDoc>(pageId)

  if (_page?.sharedWithGroups?.length) {
    for (const _groupId of _page.sharedWithGroups) {
      console.log(
        '[removeAllGroupsFromPage] groupId pageId',
        _groupId,
        _page._id
      )
      const _prefix = _groupId.substring(0, 2)
      // is shared page
      if (_prefix === 'p_') {
        setPublicPage(_page._id, false)
      }
      // is in shared group
      if (_prefix === 'g_') {
        // remove page from local groupId
        const _groupDocument = await getDocument<Group>(_groupId)
        if (_groupDocument) {
          upsertImmediate({
            doctype: DocumentType.Group,
            _id: _groupId,
            doc: {
              ..._groupDocument,
              pages: _groupDocument.pages.filter((p) => p !== _page._id),
            },
          })
        }
        // remove group from page documents
        setGroupPageAction(_groupId, _page._id, PageAction.REMOVE)
      }
    }
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
      await removeGroupFromPage({ pageId, groupId })
    }

    // delete group locally
    await upsertImmediate({
      doctype: DocumentType.Group,
      _id: groupId,
      doc: { ..._group, _deleted: true },
    })

    if (isPublic) {
      // delete group from cloudant
      setGroupAction(groupId, GroupAction.UNSHARED)
    }
  }
}
