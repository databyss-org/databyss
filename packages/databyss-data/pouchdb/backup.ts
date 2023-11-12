import PouchDB from 'pouchdb'

export async function backupDbToJson(db: PouchDB.Database<any>) {
  const { rows } = await db.allDocs({ include_docs: true })
  const data = rows.map((row) => row.doc)
  return JSON.stringify(data, null, 2)
}
