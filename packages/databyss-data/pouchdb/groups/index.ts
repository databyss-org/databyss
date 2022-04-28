import { Group } from '@databyss-org/services/interfaces/Group'
import _ from 'lodash'
import { httpDelete, httpPost } from '@databyss-org/services/lib/requestApi'
import {
  setPouchSecret,
  deletePouchSecret,
  getPouchSecret,
} from '@databyss-org/services/session/clientStorage'
import { Document } from '@databyss-org/services/interfaces'
import { InlineTypes } from '@databyss-org/services/interfaces/Range'
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
import { getAtomicsFromFrag } from '../../../databyss-editor/lib/clipboardUtils/getAtomicsFromSelection'
import {
  dbRef,
  MakePouchReplicationErrorHandler,
  REMOTE_CLOUDANT_URL,
} from '../db'
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
}) =>
  // console.log('[removeIdsFromSharedDb]', ids, groupId)
  httpPost(`/cloudant/groups/${groupId}/remove`, {
    data: { ids, groupId },
  })

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
  // add credentials to localstorage
  setPouchSecret(Object.values(res.data))
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

    // console.log('[removeGroupsFromDocument] upsert', document)
    await upsertImmediate({
      doctype: document.doctype,
      _id: document._id,
      doc: document,
    })
  }
}

enum DocumentGroupsAction {
  Add = 'ADD',
  Remove = 'REMOVE',
}

export async function editPageDocumentGroups(
  page: PageDoc,
  groupIds: string[],
  action: DocumentGroupsAction
) {
  // console.log('[editPageDocumentGroups]', action, page, groupIds)
  if (action === DocumentGroupsAction.Add && !page.sharedWithGroups?.length) {
    return null
  }
  const _idsToUpdate = await docIdsRelatedToPage(
    page,
    action === DocumentGroupsAction.Remove ? groupIds[0] : null
  )

  // console.log('[editPageDocumentGroups] _idsToUpdate', _idsToUpdate)

  // get all the docs
  const _docsToUpdate = Object.values(
    await getDocuments<Document>(_idsToUpdate.all)
  ).filter((_d) => !!_d) as Document[]

  // edit the group(s) in all docs
  _docsToUpdate.forEach((_doc) => {
    _doc.sharedWithGroups =
      action === DocumentGroupsAction.Add
        ? Array.from(
            new Set(
              (_doc.sharedWithGroups ?? []).concat(page.sharedWithGroups!)
            )
          )
        : (_doc.sharedWithGroups ?? []).filter((_id) => !groupIds.includes(_id))
  })

  // write all docs as a batch
  // console.log('[editPageDocumentGroups] _bulk_docs', action, page, groupIds)
  await dbRef.current!.bulkDocs(_docsToUpdate)

  // console.log('[editPageDocumentGroups] 🟢', action, page, groupIds)

  return _idsToUpdate
}

export const addGroupToDocumentsInPage = async (page: PageDoc) =>
  editPageDocumentGroups(page, page.sharedWithGroups!, DocumentGroupsAction.Add)

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
  const _page = await getDocument<PageDoc>(pageId)
  if (_page && !_page?.sharedWithGroups?.includes(groupId)) {
    // add groupId to page array if does not already exist
    await addGroupToDocument([groupId], _page)
  }
  return _page
}

const upsertReplication = async ({
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

  // console.log('[upsertReplication]', groupId)

  const _findRes = await dbRef.current?.find({
    selector: {
      sharedWithGroups: {
        $elemMatch: {
          $eq: groupId,
        },
      },
    },
  })

  const _docIds = _findRes?.docs.map((doc) => doc._id)
  // console.log('[upsertReplication] doc ids', _docIds)

  // upsert replication
  dbRef
    .current!.replicate!.to(`${REMOTE_CLOUDANT_URL}/${groupId}`, {
      ...opts,
      doc_ids: _docIds,
      batch_size: 1000,
    })
    .on('error', MakePouchReplicationErrorHandler('[upsertReplication]'))
}

/**
 * one time replication to upsert a @groupId to remote DB
 */
export const replicateGroup = async ({
  groupId,
  isPublic,
}: {
  groupId: string
  isPublic: boolean
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
  console.log('[setGroup]', group)
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
  setGroupAction({
    groupId: group._id,
    action: GroupAction.CREATE_OR_UPDATE,
    isPublic: group.public,
  })
}

/**
 * Returns a report of all docs in the page
 * @groupId If set, only include related docs (eg topic, source) where this page is the only page that it appears in, for this group
 */
export async function docIdsRelatedToPage(
  page: PageDoc,
  groupId: string | null
) {
  // console.log('[docIdsRelatedToPage]', page, groupId)
  const _pageBlockIds = page.blocks
    .filter((_pb) => !_pb.type?.match(/^END_/))
    .map((_pb) => _pb._id)
  const _blocks = Object.values(
    await getDocuments<Block>(_pageBlockIds)
  ).filter((_b) => !!_b) as Block[]
  const _blockIds = _blocks.map((_b) => _b._id)
  const _entryBlocks = _blocks.filter(
    (_block) => _block.type === BlockType.Entry
  )
  const _entryBlockIds = _entryBlocks.map((_b) => _b._id)
  const _relatedBlocks = getAtomicsFromFrag(_blocks)

  // we want to include blockRelations for Links, but not the linked pages
  let _relatedBlockIds = _relatedBlocks
    .filter((_b) => _b.type !== InlineTypes.Link)
    .map((_b) => _b._id)
  let _relationIds = _relatedBlocks.map((_b) => `r_${_b._id}`)

  // console.log('[docIdsRelatedToPage] blocks', _blocks)

  if (groupId) {
    // include non-entry blocks if they don't appear in other pages in the shared group
    const _group = await getDocument<Group>(groupId)
    // console.log('[docIdsRelatedToPage] group', _group)
    const _relations = await getDocuments<BlockRelation>(_relationIds)
    // console.log('[docIdsRelatedToPage] relations', _relations)
    _relatedBlockIds = []
    _relationIds = []
    for (const _relatedBlockRef of _relatedBlocks) {
      const _relation = _relations[`r_${_relatedBlockRef._id}`]
      // only include related block if it doesn't exist on other pages
      let _relatedPagesInGroup: string[] = []
      if (_relation) {
        _relatedPagesInGroup = relatedPagesInGroup(_group!, _relation)
      }
      if (_relatedPagesInGroup.length > 1) {
        continue
      }
      if (
        !_relatedPagesInGroup.length ||
        _relatedPagesInGroup[0] === page._id
      ) {
        _relatedBlockIds.push(_relatedBlockRef._id)
        _relationIds.push(`r_${_relatedBlockRef._id}`)
      }
    }
  }

  return {
    all: Array.from(
      new Set(
        [page.selection]
          .concat(_entryBlockIds)
          .concat(_relatedBlockIds)
          .concat(_relationIds)
      )
    ),
    selection: page.selection,
    blocks: _blockIds,
    entryBlocks: _entryBlockIds,
    relatedBlockIds: _relatedBlockIds,
    relationIds: _relationIds,
  }
}

/**
 * Removes given groupId from any document associated with pageId
 * @returns an array of document _ids to delete from the shared db on cloudant
 */
export const removeGroupFromDocumentsInPage = async (
  page: PageDoc,
  groupId: string
) => editPageDocumentGroups(page, [groupId], DocumentGroupsAction.Remove)

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

  // removes groupId from sharedWithGroups array
  await removeGroupsFromDocument([groupId], _page)

  const _res = await removeGroupFromDocumentsInPage(_page, groupId)
  return [pageId].concat(_res?.all ?? [])
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
    const _page = await addPageToGroup({ pageId, groupId: _data._id })

    await addGroupToDocumentsInPage(_page!)

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
    setGroupAction({
      groupId: _data._id,
      action: GroupAction.CREATE_OR_UPDATE,
      isPublic: true,
    })
  } else {
    // page is removed from sharing

    // crawl page and remove groupId from documents
    // console.log('[setPublicPage] remove docs', _data._id)
    await removeGroupFromPage({ pageId, groupId: _data._id })

    // delete group from pouchDb
    // console.log('[setPublicPage] remove group', _data._id)
    await upsertImmediate({
      doctype: DocumentType.Group,
      _id: _data._id,
      doc: { ..._data, _deleted: true },
    })

    // remove database from cloudant
    setGroupAction({ groupId: _data._id, action: GroupAction.DESTROY })
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
  await replicateGroup({
    groupId,
    isPublic,
  })
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
  const _page = await getDocument<PageDoc>(pageId)
  if (_page) {
    // add propagate sharedWithGroups property to all documents
    await addGroupToDocumentsInPage(_page)
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
  // console.log('[removeAllGroupsFromPage]')
  const _page = await getDocument<PageDoc>(pageId)

  if (_page?.sharedWithGroups?.length) {
    for (const _groupId of _page.sharedWithGroups) {
      // console.log(
      //   '[removeAllGroupsFromPage] groupId pageId',
      //   _groupId,
      //   _page._id
      // )
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
    const { _id: groupId } = _group

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

    // delete group from cloudant
    setGroupAction({ groupId, action: GroupAction.DESTROY })
  }
}
