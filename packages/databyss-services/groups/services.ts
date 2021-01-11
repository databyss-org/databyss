import { groupHeaders } from '@databyss-org/ui/stories/Components/Sidebar/fixtures'
import { GroupHeader } from '../interfaces'

export const sleep = (m: number) => new Promise((r) => setTimeout(r, m))

export const getGroupHeaders = async (): Promise<GroupHeader[]> => {
  await sleep(50)
  return groupHeaders
}
