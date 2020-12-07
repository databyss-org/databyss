// import { DocumentScope, DocumentInsertResponse, ViewDocument } from 'nano'

// type WithDesignDoc<D> = D | DesignDoc

// export interface WithUpsert<D> {
//   upsert: (
//     docname: string,
//     callback: (oldDocument: ViewDocument<D> | undefined) => D
//   ) => DocumentInsertResponse
// }

// EXTENDS documentscope to include upsert
declare module 'nano' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface DocumentScope<D> {
    upsert: (docname: string, callback: (oldDocument: any) => any) => any
  }
}

export default null
// export type CouchDB<D> = DocumentScope<WithDesignDoc<D>> &
//   WithUpsert<WithDesignDoc<D>>
