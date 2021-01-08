import { db, addTimeStamp } from '../../db'

const deletePage = (id: string) =>
  db.upsert(id, (oldDoc) => ({
    ...addTimeStamp(oldDoc),
    _deleted: true,
  }))

export default deletePage
