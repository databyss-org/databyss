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
  console.log('SET GROUP ACTIONS', groupId, action)
  const _dict = getGroupActionQ()
  console.log('DICTIONARY', _dict)
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
  if (pageId && _dict[groupId].pages) {
    // just remove the page action
    delete _dict[groupId].pages?.[pageId]
    // cleanup group if we can
    if (
      !_dict[groupId].action &&
      _dict[groupId].pages &&
      Object.keys(_dict[groupId].pages!).length === 0
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
    console.log(groupPayload)

    const _groupAction = groupPayload?.action
    if (_groupAction) {
      try {
        removeGroupAction(groupId)
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
      for (const pageId of Object.values(groupPayload.pages)) {
        const _pageAction = groupPayload.pages[pageId]
        // remove the action from the queue
        removeGroupAction(groupId, pageId)
        try {
          // perform the action
          if (_pageAction === PageAction.REMOVE) {
            // finishing removing page (and related entities) from group
            console.log('REMOVE THIS PAGE', pageId)
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

// user adds page 'iu2489hrkjhd' to group 'kjf98y234hri'
// group.pages.push('iu2489hrkjhd')
// upsert('iu2489hrkjhd', group)
// page.sharedWithGroups.push('kjf98y234hri')
// upsert('iu2489hrkjhd', page)
// record action or nullify previous action
// setGroupAction('iu2489hrkjhd', 'kjf98y234hri', 'ADD')
// process the action during the replication 'pause' event

//     .on('pause', () => {
//     // for each page in the groupActionsQ
//     const _q = getGroupActionQ
//     for (const groupId of Object.keys(_q())) {
//       try {
//         if (_q()[groupId].action) {
//           const _groupAction = _q()[groupId].action
//           removeGroupAction(groupId)
//           await replicateSharedGroup(groupId, _q()[groupId].action === 'SHARED')
//         }
//       } catch (err) {
//         console.log('groupActionQueue error', err)
//         setGroupAction(groupId, action)
//       }
//       // check for add/remove action for page
//       for (const pageId of Object.values(_q()[groupId].pages)) {
//         const _pageAction = _q()[groupId].pages[pageId]
//         // remove the action from the queue
//         removeGroupAction(groupId, pageId)
//         try {
//           // perform the action
//           if (_action === 'REMOVE') {
//             // finishing removing page (and related entities) from group
//             await replicateRemovePageFromGroup(groupId, pageId)
//           }
//           if (_action === 'ADD') {
//             await upsertReplication(groupId)
//           }
//         } catch (err) {
//           console.log('groupActionQueue error', err)
//           setGroupAction(groupId, pageId, _action)
//         }
//       }
//     }
//   })

//   {
//     //groupId
//     'kjf98y234hri': {
//       action: 'SHARED',
//       pages: {
//         //pageId
//         'iu2489hrkjhd': 'REMOVE',
//         'adklfj98weyu': 'ADD'
//       }
//     },
//     // groupId (went from public -> not public)
//     'auu89u93j3s3': {
//       action: 'UNSHARED'
//     }
//   }
