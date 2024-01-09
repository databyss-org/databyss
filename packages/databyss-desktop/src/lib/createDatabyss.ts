import {
  DocumentType,
  PageDoc,
  UserPreference,
} from '@databyss-org/data/pouchdb/interfaces'
import { Page } from '@databyss-org/services/interfaces/Page'
import { initNodeDb, NodeDbRef, nodeDbRefs, setGroupLoaded } from '../nodeDb'
import { uid, uidlc } from '@databyss-org/data/lib/uid'
import { Group } from '@databyss-org/services/interfaces'
import { addTimeStamp } from '@databyss-org/data/pouchdb/docUtils'
import { appState } from '../eapi/handlers/state-handlers'
import { Role } from '@databyss-org/data/interfaces/sysUser'

export const normalizePage = (page: Page): PageDoc => {
  const _pageDoc: PageDoc = {
    blocks: page.blocks.map((_b) => ({ _id: _b._id, type: _b.type })),
    selection: page.selection._id,
    _id: page._id,
    name: page.name,
    archive: page.archive,
  }
  return _pageDoc
}

export const initializeNewPage = async ({
  groupId,
  pageId,
  skipTitleBlock,
  nodeDbRef,
}: {
  groupId: string
  pageId: string
  skipTitleBlock?: boolean
  nodeDbRef: NodeDbRef
}) => {
  const _page: any = new Page(pageId, { skipTitleBlock })
  // upsert selection
  await nodeDbRef.current.upsert(_page.selection._id, () => ({
    doctype: DocumentType.Selection,
    createdAt: Date.now(),
    belongsToGroup: groupId,
    ..._page.selection,
  }))
  // upsert blocks
  for (const _block of _page.blocks) {
    await nodeDbRef.current.upsert(_block._id, () => ({
      doctype: DocumentType.Block,
      createdAt: Date.now(),
      belongsToGroup: groupId,
      ..._block,
    }))
  }
  // upsert page
  await nodeDbRef.current.upsert(_page._id, () => ({
    createdAt: Date.now(),
    doctype: DocumentType.Page,
    belongsToGroup: groupId,
    ...normalizePage(_page),
  }))
  // user preference doc
  const _userPreferences: UserPreference = {
    _id: 'user_preference',
    userId: 'local',
    belongsToGroup: groupId,
    createdAt: Date.now(),
    groups: [
      {
        groupId,
        defaultPageId: _page._id,
        role: Role.GroupAdmin,
      },
    ],
  }
  await nodeDbRef.current.upsert(_userPreferences._id, () => ({
    ..._userPreferences,
    doctype: DocumentType.UserPreferences,
  }))
}

export const createDatabyss = async (windowId: number) => {
  const _groupId = `g_${uidlc()}`
  await initNodeDb(windowId, _groupId)
  await initializeNewPage({ 
    groupId: _groupId, 
    pageId: uid(),
    nodeDbRef: nodeDbRefs[windowId]
  })
  const _groupDoc: Group = {
    _id: _groupId,
    name: process.env.UNTITLED_GROUP_NAME,
    pages: [],
    localGroup: true,
  }
  await nodeDbRefs[windowId].current.put(addTimeStamp(_groupDoc))
  // add GROUP doc to app state
  const groups = (appState.get('localGroups') ?? []) as Group[]
  appState.set('localGroups', [...groups, _groupDoc])
  setGroupLoaded(windowId)
}
