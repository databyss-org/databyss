import { Group } from '@databyss-org/services/interfaces/Group'
import { DocumentType } from '../interfaces'
import { upsertImmediate } from '../utils'

export const setGroup = async (group: Group) => {
  // prevent duplicates
  let _pages = group.pages
  _pages = _pages.filter((v, i, a) => a.indexOf(v) === i)
  group.pages = _pages

  await upsertImmediate({
    $type: DocumentType.Group,
    _id: group._id,
    doc: { ...group, $type: DocumentType.Group },
  })
}

export const setPublicPage = (pageId: string, bool: boolean) => {
  const _data: Group = {
    _id: `p_${pageId}`,
    pages: [pageId],
    public: bool,
  }
  upsertImmediate({
    $type: DocumentType.Group,
    _id: _data._id,
    doc: _data,
  })
}
