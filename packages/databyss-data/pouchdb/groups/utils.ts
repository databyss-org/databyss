import { Group } from '@databyss-org/services/interfaces/Group'
import {
  updateAndReplicateSharedDatabase,
  replicateGroup,
  removePageFromGroup,
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
    // _dict[groupId].pages &&
    _dict![groupId].pages?.[pageId] &&
    _dict[groupId].pages?.[pageId] !== action
  ) {
    delete _dict[groupId].pages?.[pageId]
  } else {
    _dict[groupId].pages![pageId] = action
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

export async function processGroupActionQ() {
  const _q = getGroupActionQ
  for (const groupId of Object.keys(_q())) {
    const groupPayload: QueuePayload = _q()[groupId]

    const _groupAction = groupPayload?.action
    if (_groupAction) {
      removeGroupAction(groupId)
      try {
        await updateAndReplicateSharedDatabase({
          groupId,
          isPublic: GroupAction.SHARED === _groupAction,
        })
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
            await replicateGroup({ groupId: `g_${groupId}`, isPublic: true })
          }
        } catch (err) {
          console.log('groupActionQueue error', err)
          setGroupPageAction(groupId, pageId, _pageAction)
        }
      }
    }
  }
}
