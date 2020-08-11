import React, { useEffect } from 'react'
import { useParams } from '@reach/router'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import {
  BlockRelationsLoader,
  SourceCitationsLoader,
} from '@databyss-org/ui/components/Loaders'
import { Text, View, BaseControl, Icon } from '@databyss-org/ui/primitives'
import IndexPageContent from '../PageContent/IndexPageContent'
import IndexSourceContent from './IndexSourceContent'

const SourcesCitations = () => {
  const { query } = useParams()

  return (
    <SourceCitationsLoader>
      {sourceCitations => {
        const _header = sourceCitations[query].text.textValue

        return (
          <IndexPageContent title={_header}>
            <BlockRelationsLoader atomicId={query}>
              {relations => <IndexSourceContent relations={relations} />}
            </BlockRelationsLoader>
          </IndexPageContent>
        )
      }}
    </SourceCitationsLoader>
  )
}

export default SourcesCitations
