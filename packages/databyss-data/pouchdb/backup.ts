import PouchDB from 'pouchdb'

 export async function backupDbToJson(db: PouchDB.Database<any>) {
   const { rows } = await db.allDocs({ include_docs: true })
   const data = rows.map((row) => row.doc)
   return JSON.stringify(data, null, 2)
 }

 export function makeBackupFilename(groupId: string) {
    return `databyss-db-${groupId.substring(
        2
      )}-${new Date()
        .toISOString()
        .replace('T', '_')
        .replaceAll(':', '')
        .substring(0, 17)}`
 }