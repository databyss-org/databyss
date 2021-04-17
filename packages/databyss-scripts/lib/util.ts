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

// export async function getAllDbsForUser(userId: string) {
//   const _dbNames = []

//   // get the default group from user doc
//   const _user = await cloudant.models.Users.get(userId)
//   const _defaultGroupId = _user.defaultGroupId!
//   _dbNames.push(_defaultGroupId)

//   // find all groups that belong to this user
// }
