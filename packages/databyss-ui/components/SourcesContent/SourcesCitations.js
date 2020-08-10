import React, { useEffect } from 'react'
import { useParams } from '@reach/router'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'

const SourcesCitations = () => {
  const findBlockRelations = useEntryContext(c => c.findBlockRelations)
  const { query } = useParams()
  console.log(query)
  useEffect(() => {
    findBlockRelations(query)
  }, [])
  return <div>test</div>
}

export default SourcesCitations
