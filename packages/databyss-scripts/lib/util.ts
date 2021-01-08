import { parse } from 'dotenv'
import { uid } from '@databyss-org/data/lib/uid'

const fs = require('fs')

export interface EnvDict {
  [key: string]: string
}

export function objectId(): string {
  return uid()
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
