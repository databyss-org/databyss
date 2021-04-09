import { Group } from '@databyss-org/services/interfaces/Group'
import { BlockRelation } from '@databyss-org/services/interfaces'
import {
  updateAndReplicateSharedDatabase,
  replicateGroup,
  removePageFromGroup,
  removeSharedDatabase,
} from './index'
import { findOne } from '../utils'
import { DocumentType, PageDoc } from '../interfaces'

export enum GroupAction {
  SHARED = 'SHARED',
  UNSHARED = 'UNSHARED',
}

export enum PageAction {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}

interface QueuePayload {
  action?: GroupAction
  pages?: {
    [pageId: string]: PageAction
  }
}

interface GroupActionQ {
  [groupId: string]: QueuePayload
}

// shareQ API
export function getGroupActionQ(): GroupActionQ {
  let _actionJson = localStorage.getItem('groupActionQ')
  if (!_actionJson) {
    _actionJson = '{}'
  }
  return JSON.parse(_actionJson)
}

export function setGroupActionQ(_d) {
  localStorage.setItem('groupActionQ', JSON.stringify(_d))
}

export function setGroupAction(groupId: string, action: GroupAction) {
  const _dict = getGroupActionQ()
  if (!_dict[groupId]) {
    _dict[groupId] = {}
  }
  if (_dict[groupId].action && _dict[groupId].action !== action) {
    // nullify previous action if it's different
    delete _dict[groupId].action
  } else {
    _dict[groupId].action = action
  }
  setGroupActionQ(_dict)
}

export function setGroupPageAction(
  groupId: string,
  pageId: string,
  action: PageAction
) {
  const _dict = getGroupActionQ()
  if (!_dict[groupId]) {
    _dict[groupId] = { pages: {} }
  }
  // nullify previous action if it's different
  if (
    _dict![groupId].pages?.[pageId] &&
    _dict[groupId].pages?.[pageId] !== action
  ) {
    delete _dict[groupId].pages?.[pageId]
  } else {
    _dict[groupId].pages = {
      ..._dict[groupId].pages,
      [pageId]: action,
    }
  }
  setGroupActionQ(_dict)
  return _dict
}

export function removeGroupAction(groupId: string, pageId?: string) {
  const _dict = getGroupActionQ()
  if (pageId && _dict[groupId]?.pages) {
    // just remove the page action
    delete _dict[groupId].pages?.[pageId]

    // cleanup group if we can
    if (
      !_dict[groupId]?.action &&
      _dict[groupId].pages &&
      Object.keys(_dict[groupId]?.pages!).length === 0
    ) {
      delete _dict[groupId]
    }
  } else {
    // just remove the group
    delete _dict[groupId]
  }
  setGroupActionQ(_dict)

  return _dict
}

export async function processGroupActionQ(dispatch: Function) {
  const _q = getGroupActionQ
  // update ui element
  if (Object.keys(_q()).length) {
    dispatch({
      type: 'DB_BUSY',
      payload: {
        isBusy: true,
        writesPending: Object.keys(_q()).length,
      },
    })
  }

  for (const groupId of Object.keys(_q())) {
    const groupPayload: QueuePayload = _q()[groupId]

    const _groupAction = groupPayload?.action
    if (_groupAction) {
      removeGroupAction(groupId)
      try {
        switch (_groupAction) {
          case GroupAction.SHARED: {
            await updateAndReplicateSharedDatabase({ groupId, isPublic: true })
            break
          }
          case GroupAction.UNSHARED: {
            await removeSharedDatabase(groupId)
            break
          }
        }
      } catch (err) {
        console.log('groupActionQueue error', err)
        setGroupAction(groupId, _groupAction)
      }
    }
    // check for add/remove action for page
    if (groupPayload.pages) {
      for (const pageId of Object.keys(groupPayload.pages)) {
        const _pageAction = groupPayload.pages[pageId]

        // remove the action from the queue
        removeGroupAction(groupId, pageId)
        try {
          // perform the action
          if (_pageAction === PageAction.REMOVE) {
            // finishing removing page (and related entities) from group
            const page: PageDoc | null = await findOne({
              doctype: DocumentType.Page,
              query: { _id: pageId },
            })
            const group: Group | null = await findOne({
              doctype: DocumentType.Group,
              query: { _id: groupId },
            })
            if (page && group) {
              await removePageFromGroup({
                page,
                group,
              })
            }
          }
          if (_pageAction === PageAction.ADD) {
            await replicateGroup({ groupId, isPublic: true })
          }
        } catch (err) {
          console.log('groupActionQueue error', err)
          setGroupPageAction(groupId, pageId, _pageAction)
        }
      }
    }
  }
  // set busy to false
  dispatch({
    type: 'DB_BUSY',
    payload: {
      isBusy: false,
      writesPending: 0,
    },
  })
}

/**
 * Returns the intersection of @relation.pages and @group.pages
 * @param group Returned pages are in this group
 * @param relation Return pages are in this BlockRelation
 * @returns Array of Page Ids
 */
export function relatedPagesInGroup(group: Group, relation: BlockRelation) {
  return relation.pages.filter((p) => group.pages.includes(p))
}
