/* eslint-disable camelcase */

import { JSONSchema4 } from 'json-schema'

export interface DesignDocLibs {
  tv4: string
}

export interface DesignDoc {
  _id: string
  validate_doc_update: string
  libs: DesignDocLibs
  schema: JSONSchema4
}
