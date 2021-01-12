import { groupHeaders } from '@databyss-org/ui/stories/Components/Sidebar/fixtures'
import { Group, GroupHeader } from '../interfaces'

export const sleep = (m: number) => new Promise((r) => setTimeout(r, m))

export const getGroupHeaders = async (): Promise<GroupHeader[]> => {
  await sleep(50)
  return groupHeaders
}

export const saveGroup = (group: Group) => {
  groupHeaders.push(group)
}
