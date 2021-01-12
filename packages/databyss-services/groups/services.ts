import {
  groupHeaders,
  groupDetails,
} from '@databyss-org/ui/stories/Components/Sidebar/fixtures'
import { Group, GroupHeader } from '../interfaces'

export const sleep = (m: number) => new Promise((r) => setTimeout(r, m))

export const getGroupHeaders = async (): Promise<GroupHeader[]> => {
  await sleep(50)
  return groupHeaders
}

export const getGroup = async (id: string): Promise<Group[]> => {
  await sleep(50)
  return groupDetails[id]
}

export const saveGroup = (group: Group) => {
  groupHeaders.push(group)
}
