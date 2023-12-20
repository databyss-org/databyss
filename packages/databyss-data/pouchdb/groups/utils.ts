import { Group } from '@databyss-org/services/interfaces/Group'
import {
  BlockRelation,
  ResourceNotFoundError,
} from '@databyss-org/services/interfaces'
import {
  updateAndReplicateSharedDatabase,
  replicateGroup,
  removePageFromGroup,
  removeSharedDatabase,
} from './index'
import { setDbBusy } from '../utils'
import { PageDoc } from '../interfaces'
import { getDocument } from '../crudUtils'

export enum GroupAction {
  SHARED = 'SHARED',
  UNSHARED = 'UNSHARED',
}

export enum PageAction {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}

interface QueuePayload {
  retry: number
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

export function setGroupAction(
  groupId: string,
  action: GroupAction,
  retry: number = 0
) {
  const _dict = getGroupActionQ()
  if (!_dict[groupId]) {
    _dict[groupId] = { retry }
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
  action: PageAction,
  retry: number = 0
) {
  const _dict = getGroupActionQ()
  if (!_dict[groupId]) {
    _dict[groupId] = { pages: {}, retry }
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

export async function processGroupActionQ() {
  const _q = getGroupActionQ
  // update ui element
  if (Object.keys(_q()).length) {
    setDbBusy(true, Object.keys(_q()).length)
  }

  for (const groupId of Object.keys(_q())) {
    const groupPayload: QueuePayload = _q()[groupId]

    const _groupAction = groupPayload?.action
    const _retry = groupPayload?.retry ?? 0
    if (_groupAction) {
      removeGroupAction(groupId)
      try {
        switch (_groupAction) {
          case GroupAction.SHARED: {
            await updateAndReplicateSharedDatabase({ groupId, isPublic: true })
            break
          }
          case GroupAction.UNSHARED: {
            try {
              await removeSharedDatabase(groupId)
            } catch (err) {
              if (!(err instanceof ResourceNotFoundError)) {
                throw err
              }
            }
            break
          }
        }
      } catch (err) {
        if (_retry < 5) {
          console.warn(
            'groupActionQueue error',
            groupPayload,
            JSON.stringify(err)
          )
          setGroupAction(groupId, _groupAction, _retry + 1)
        } else {
          throw err
        }
      }
    }
    // check for add/remove action for page
    if (groupPayload?.pages) {
      for (const pageId of Object.keys(groupPayload.pages)) {
        const _pageAction = groupPayload.pages[pageId]

        // remove the action from the queue
        removeGroupAction(groupId, pageId)
        try {
          // perform the action
          if (_pageAction === PageAction.REMOVE) {
            // finishing removing page (and related entities) from group
            const page = await getDocument<PageDoc>(pageId)
            const group = await getDocument<Group>(groupId)
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
          if (_retry < 5) {
            console.warn(
              'groupActionQueue error',
              groupPayload,
              JSON.stringify(err)
            )
            setGroupPageAction(groupId, pageId, _pageAction, _retry + 1)
          } else {
            throw err
          }
        }
      }
    }
  }
  // set busy to false
  setDbBusy(false)
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
