import { setGroup } from '@databyss-org/data/pouchdb/groups'
import { getDocument } from '@databyss-org/data/pouchdb/utils'
import { Group } from '../interfaces'

export const UNTITLED_NAME = 'untitled collection'

export const saveGroup = (group: Group, pageId?: string) =>
  setGroup(group, pageId)

export const getGroup = (id: string) => getDocument(id)
