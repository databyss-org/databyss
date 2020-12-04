import { DocumentScope, DocumentInsertResponse, ViewDocument } from 'nano'
import { DesignDoc } from './designdoc'

type WithDesignDoc<D> = D | DesignDoc

interface WithUpsert<D> {
  upsert: (
    docname: string,
    callback: (oldDocument: ViewDocument<D> | undefined) => D
  ) => DocumentInsertResponse
}
export type CouchDB<D> = DocumentScope<WithDesignDoc<D>> &
  WithUpsert<WithDesignDoc<D>>
