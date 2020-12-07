export type { Group, GroupSession } from './group'
export type { Login } from './login'
export { Role } from './user'
export type { User, UserGroup } from './user'
export type { JsonSchema } from './jsonschema'
// export type { CouchDB } from './database'
export type { DesignDoc } from './designdoc'

// EXTENDS documentscope to include upsert
declare module 'nano' {
  interface DocumentScope<D> {
    upsert: (docname: string, callback: (oldDocument: D) => D) => D
  }
}
