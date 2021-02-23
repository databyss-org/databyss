/* eslint-disable camelcase */
import { JSONSchema4 } from 'json-schema'

export interface DesignDocLibs {
  tv4: string
}

export interface DesignDoc {
  _id: string
  validate_doc_update: string
  libs: DesignDocLibs
  schema?: JSONSchema4
  sourceSchema: JSONSchema4
  textSchema: JSONSchema4
  pouchDocSchema: JSONSchema4
  blockSchema: JSONSchema4
  blockRelationSchema: JSONSchema4
  selectionSchema: JSONSchema4
  pageSchema: JSONSchema4
  groupSchema: JSONSchema4
  entrySchema: JSONSchema4
  topicSchema: JSONSchema4
  userPreferenceSchema: JSONSchema4
  pointSchema: JSONSchema4
}
