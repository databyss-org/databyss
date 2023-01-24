import * as nano from 'nano'

export {
  updateSysDesignDocs,
  initiateDatabases,
  updateValidationDesignDoc,
  updateGroupDesignDocs,
  updateIndexDesignDocs,
} from './util'
export { cloudant } from './cloudant'
export type { DocumentScope } from 'nano'

declare module 'nano' {
  export interface DocumentScope<D> {
    upsert: (docname: string, callback: (oldDocument: D) => D) => D
    /**
     * Wraps db.get in a try/catch so that missing documents return null instead of
     * throwing an error
     * @param name Document _id
     * @returns document or null if not found
     */
    tryGet: (name: string) => Promise<(nano.DocumentGetResponse & D) | null>
  }
}
