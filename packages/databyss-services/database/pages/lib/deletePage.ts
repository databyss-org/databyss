import { db } from '../../db'

const deletePage = (id: string) =>
  db.upsert(id, (oldDoc) => ({
    ...oldDoc,
    _deleted: true,
  }))

export default deletePage
