import React from 'react'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import {
  BlockRelationsLoader,
  SourceCitationsLoader,
  PagesLoader,
} from '@databyss-org/ui/components/Loaders'
import { Helmet } from 'react-helmet'
import IndexPageContent from '../PageContent/IndexPageContent'
import IndexSourceContent from './IndexSourceContent'

const SourcesCitations = () => {
  const { query } = useParams()

  return (
    <SourceCitationsLoader>
      {(sourceCitations) => {
        const _header = sourceCitations[query].text.textValue
        return (
          <IndexPageContent title={_header}>
            <Helmet>
              <meta charSet="utf-8" />
              <title>{_header}</title>
            </Helmet>
            <PagesLoader>
              {() => (
                <BlockRelationsLoader atomicId={query}>
                  {(relations) => <IndexSourceContent relations={relations} />}
                </BlockRelationsLoader>
              )}
            </PagesLoader>
          </IndexPageContent>
        )
      }}
    </SourceCitationsLoader>
  )
}

export default SourcesCitations
