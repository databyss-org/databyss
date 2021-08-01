import React, { ReactNode } from 'react'
import { useBibliography } from '@databyss-org/data/pouchdb/hooks'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'
import { CitationFormatOptions } from '@databyss-org/services/interfaces'
import { CitationView } from './CitationView'
import { ViewProps } from '../..'

export interface SourceCitationViewProps extends ViewProps {
  sourceId: string
  formatOption: CitationFormatOptions
  noCitationFallback?: ReactNode
}

export const SourceCitationView = ({
  sourceId,
  formatOptions,
  noCitationFallback,
  ...others
}) => {
  const bibliographyRes = useBibliography({
    formatOptions,
    sourceIds: [sourceId],
  })
  if (!bibliographyRes.isSuccess) {
    return <LoadingFallback queryObserver={bibliographyRes} />
  }

  if (
    !bibliographyRes.data[sourceId] ||
    !bibliographyRes.data[sourceId].citation?.length
  ) {
    return noCitationFallback
  }
  return (
    <CitationView
      citation={bibliographyRes.data[sourceId].citation}
      formatOptions={formatOptions}
      {...others}
    />
  )
}
