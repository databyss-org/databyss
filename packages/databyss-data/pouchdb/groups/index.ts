import { Group } from '@databyss-org/services/interfaces/Group'
import { DocumentType } from '../interfaces'
import { upsertImmediate } from '../utils'

export const setGroup = (group: Group) =>
  upsertImmediate({
    $type: DocumentType.Group,
    _id: group._id,
    doc: { ...group, $type: DocumentType.Group },
  })
