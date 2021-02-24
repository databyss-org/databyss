import { setGroup } from '@databyss-org/data/pouchdb/groups'
import { Group } from '../interfaces'

export const UNTITLED_NAME = 'untitled collection'

export const saveGroup = (group: Group) => setGroup(group)
