import ObjectID from 'bson-objectid'

export const updateTimestamps = (doc) => {
  const now = new Date()
  if (!doc.createdAt) {
    // extract the createdAt timestamp from the objectID of the doc
    doc.createdAt = doc._id ? ObjectID(doc._id).getTimestamp() : now
  }
  doc.updatedAt = now
}
