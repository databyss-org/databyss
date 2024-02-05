import React, { ReactNode } from 'react'
import { useBibliography } from '@databyss-org/data/pouchdb/hooks'
import { CitationFormatOptions } from '@databyss-org/services/interfaces'
import { CitationView } from './CitationView'
import { View, ViewProps } from '../..'

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
    return null
  }

  if (
    !bibliographyRes.data[0] ||
    !bibliographyRes.data[0].citation?.length
  ) {
    return <View {...others}>{noCitationFallback}</View>
  }
  return (
    <CitationView
      citation={bibliographyRes.data[0].citation}
      formatOptions={formatOptions}
      {...others}
    />
  )
}
