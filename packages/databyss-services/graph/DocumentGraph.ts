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
          _row.doc.successorOf.forEach((sid) => this.setEdge(sid, _row.doc._id))
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
  propagateChanges(pdoc: Document, deleted: boolean) {
    this.successors(pdoc._id).forEach((sid) =>
      // TODO: optimize upsert so it doesn't write unless there are changes
      dbRef.current!.upsert(sid, async (sdoc) => {
        if (!deleted) {
          // store successor relationship (do we need this?)
          sdoc.successorOf = new Set(sdoc.successorOf).add(pdoc._id)

          // propagate sharedWithGroups as union
          sdoc.sharedWithGroups = union(
            sdoc.sharedWithGroups,
            pdoc.sharedWithGroups
          )

          // update inline text references (in text.textValue)
          // TODO: optimize based on doc.doctype (e.g. only for ATOMIC -> ENTRY)
          sdoc.text = updateInlineText(sdoc.text, pdoc)
        } else {
          // remove successor/predecessor relationship
          sdoc.successorOf = new Set(sdoc.successorOf).delete(pdoc._id)
          this.removeEdge(pdoc._id, sid)

          // recalculate sharedWithGroups from remaining predecessors
          const _result = await this.predecessorDocs(sdoc._id)
          sdoc.sharedWithGroups = _result.reduce(
            (accum, curr) => union(accum, curr.sharedWithGroups),
            new Set()
          )
        }
        return sdoc
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
