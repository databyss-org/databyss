import { db, addTimeStamp } from '../../db'
import { asyncErrorHandler } from '../../util'

const deletePage = (id: string) =>
  db.upsert(id, (oldDoc) => ({
    ...addTimeStamp(oldDoc),
    _deleted: true,
  }))

export default asyncErrorHandler(deletePage)
