import PouchDB from 'pouchdb'

export async function runMigration(
  db: PouchDB.Database<any>,
  migrationId: string
) {
  switch (migrationId) {
    case '2.8.4_FIX_BACKLINKS': {
      const _res = await db.find({
        selector: {
          blockType: 'link',
        },
      })
      for (const _doc of _res.docs) {
        await db.upsert(_doc._id, () => ({
          ..._doc,
          blockType: 'LINK',
        }))
      }
      break
    }
    default:
      throw new Error(`[runMigration] bad migration id: ${migrationId}`)
  }
}
