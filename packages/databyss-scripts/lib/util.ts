import { parse } from 'dotenv'
import ObjectID from 'bson-objectid'

const fs = require('fs')

export interface EnvDict {
  [key: string]: string
}

export function objectId(): string {
  return new ObjectID().toHexString()
}

export function getEnv(envName: string): { [key: string]: string } {
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
  return envObj
}
