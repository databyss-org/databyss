import PouchDB from 'pouchdb'

export async function backupDbToJson(db: PouchDB.Database<any>) {
  const { rows } = await db.allDocs({ include_docs: true })
  const data = rows.map((row) => row.doc)
  return JSON.stringify(data, null, 2)
}

export function makeBackupFilename(groupId: string, groupName?: string) {
  let _name = ''
  if (groupName) {
    _name = groupName
      .toLocaleLowerCase()
      .replaceAll(/[^a-z ]/g, '')
      .replaceAll(' ', '-')
  }
  return `databyss-db-${_name}-${groupId.substring(
    2
  )}-${new Date()
    .toISOString()
    .replace('T', '_')
    .replaceAll(':', '')
    .substring(0, 17)}`
}
