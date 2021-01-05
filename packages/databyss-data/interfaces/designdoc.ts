/* eslint-disable camelcase */

export interface DesignDocLibs {
  tv4: string
}

export interface DesignDoc {
  _id: string
  validate_doc_update: string
  libs: DesignDocLibs
  schema?: string
  sourceSchema?: string
  textSchema?: string
}
