import { setGroup } from '@databyss-org/data/pouchdb/groups'
import { Group } from '../interfaces'

export const saveGroup = (group: Group) => setGroup(group)
