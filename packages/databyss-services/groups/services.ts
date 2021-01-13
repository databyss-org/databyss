import {
  groupHeaders,
  groupDetails,
  sharedPages,
} from '@databyss-org/ui/stories/Components/Sidebar/fixtures'
import { Group, GroupHeader, PageHeader } from '../interfaces'

export const sleep = (m: number) => new Promise((r) => setTimeout(r, m))

export const getGroupHeaders = async (): Promise<GroupHeader[]> => {
  await sleep(50)
  return groupHeaders
}

export const getSharedPageHeaders = async (): Promise<PageHeader[]> => {
  await sleep(50)
  return sharedPages
}

export const getGroup = async (id: string): Promise<Group[]> => {
  await sleep(50)
  return groupDetails[id]
}

export const saveGroup = (group: Group) => {
  groupHeaders.push(group)
}
