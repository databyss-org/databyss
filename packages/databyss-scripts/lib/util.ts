import { parse } from 'dotenv'
import { uid } from '@databyss-org/data/lib/uid'

const fs = require('fs')

export interface EnvDict {
  [key: string]: string
}

export function objectId(): string {
  return uid()
}

export function getEnv(
  envName: string,
  importEnv?: boolean
): { [key: string]: string } {
  const dotenvFiles = [`.env.${envName}.local`, `.env.${envName}`]
  let envObj = {}
  dotenvFiles.forEach((dotenvFile) => {
    if (fs.existsSync(dotenvFile)) {
      envObj = {
        ...envObj,
        ...parse(fs.readFileSync(dotenvFile)),
      }
    }
  })
  if (importEnv) {
    Object.keys(envObj).forEach((key) => {
      process.env[key] = envObj[key]
    })
  }
  return envObj
}

export function cloudantUrl(env: EnvDict) {
  return `https://${env.CLOUDANT_USERNAME}:${env.CLOUDANT_PASSWORD}@${env.REACT_APP_CLOUDANT_HOST}`
}

export const sleep = (m) => new Promise((r) => setTimeout(r, m))

/**
 * Returns true if @dbName is a system database (like 'users')
 */
export const isSystemDatabase = (dbName: string) =>
  ['users', 'groups', 'logins'].includes(dbName)

/**
 * Generate createdAt and modifiedAt fields
 */
export const timestampFields = (doc?: any) => ({
  createdAt: doc?.createdAt
    ? new Date(doc.createdAt).getTime()
    : new Date().getTime(),
  modifiedAt: doc?.updatedAt
    ? new Date(doc.updatedAt).getTime()
    : new Date().getTime(),
})

// export async function getAllDbsForUser(userId: string) {
//   const _dbNames = []

//   // get the default group from user doc
//   const _user = await cloudant.models.Users.get(userId)
//   const _defaultGroupId = _user.defaultGroupId!
//   _dbNames.push(_defaultGroupId)

//   // find all groups that belong to this user
// }

/**
 * CouchDb exports split large lists into multiple lines.
 * This function parses each line into JSON and then returns the merged result.
 * If there's only one line, it just returns the parsed contents of that line
 */
export function parseCouchExportList(text: string) {
  if (!text.startsWith('[')) {
    throw new Error('[parseCouchExportList] text is malformed or not a list')
  }
  let list = []
  text.split('\n').forEach((line) => {
    if (line.trim()) {
      list = list.concat(JSON.parse(line))
    }
  })
  return list
}
