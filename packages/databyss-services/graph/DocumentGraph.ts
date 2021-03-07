import { Graph } from 'graphlib'
import { dbRef } from '@databyss-org/data/pouchdb/db'
import { Document } from '../interfaces'

export class DocumentGraph {
  /**
   * Singleton DocumentGraph instance
   */
  static current: DocumentGraph = new DocumentGraph()

  /**
   * underlying graphlib graph instance
   */
  graph = new Graph()

  /**
   * Add edge from @source to @dest
   */
  setEdge(source: string, dest: string) {
    this.graph.setEdge(source, dest)
  }
  /**
   * Remove edge from @source to @dest
   */
  removeEdge(source: string, dest: string) {
    this.graph.removeEdge(source, dest)
  }
  /**
   * Remove node and any incident edges
   */
  removeNode(id: string) {
    this.graph.removeNode(id)
  }
  /**
   * Returns all nodes having a path to @dest
   */
  predecessors(dest: string): string[] {
    return this.graph.predecessors(dest) || []
  }
  /**
   * Returns all nodes having a path from @source
   */
  successors(source: string): string[] {
    return this.graph.successors(source) || []
  }
  /**
   * Fetch documents for all predecessors
   */
  async predecessorDocs(dest: string): Promise<Document[]> {
    return (await getDocuments(this.predecessors(dest))).rows.map(
      (row) => row.doc
    )
  }

  constructor() {
    // get all documents from the database and draw the graph
    dbRef
      .current!.allDocs()
      .then((_result) =>
        _result.rows.forEach((_row) =>
          _row.doc.successorOf.forEach((_id) => this.setEdge(_id, _row.doc._id))
        )
      )
    // listen for changes to propagate
    dbRef
      .current!.changes({
        since: 'now',
        live: true,
        include_docs: true,
        selector: { $or: [{ doctype: 'PAGE' }, { doctype: 'BLOCK' }] },
      })
      .on('change', (change) => {
        this.propagateChanges(change.doc, change.deleted!)

        if (change.deleted) {
          this.removeNode(change.id)
          return
        }

        // ensure edges
        change.doc.successorOf.forEach((_id) => {
          this.setEdge(_id, change.id)
        })
      })
  }
  /**
   * Updates dependent fields from values in predecessor node(s)
   */
  propagateChanges(doc: Document, deleted: boolean) {
    this.successors(doc._id).forEach((sid) =>
      dbRef.current!.upsert(sid, async (oldDoc) => {
        if (!deleted) {
          // store successor relationship
          oldDoc.successorOf = new Set(oldDoc.successorOf).add(doc._id)

          // propagate sharedWithGroups as union
          oldDoc.sharedWithGroups = union(
            oldDoc.sharedWithGroups,
            doc.sharedWithGroups
          )

          // update inline text references
          oldDoc.text = updateInlineText(oldDoc.text, doc)
        } else {
          // remove successor/predecessor relationship
          oldDoc.successorOf = new Set(oldDoc.successorOf).delete(doc._id)
          this.removeEdge(doc._id, sid)

          // recalculate sharedWithGroups from remaining predecessors
          const _result = await this.predecessorDocs(oldDoc._id)
          oldDoc.sharedWithGroups = _result.reduce(
            (accum, curr) => union(accum, curr.sharedWithGroups),
            new Set()
          )
        }
        return oldDoc
      })
    )
  }
}

// Set utilities
export function union(setA, setB) {
  const _union = new Set(setA)
  for (const elem of setB) {
    _union.add(elem)
  }
  return _union
}
