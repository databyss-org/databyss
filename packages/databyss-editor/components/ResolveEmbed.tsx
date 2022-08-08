import React from 'react'
import { Embed, MediaTypes } from '@databyss-org/services/interfaces/Block'
import { ViewProps } from '@databyss-org/ui'
import { UnfetchedMedia } from './UnfetchedMedia'
import { IframeComponent } from './Suggest/IframeComponent'

interface ResolveEmbedProps extends ViewProps {
  data: Embed
  highlight: boolean
  leaf: any
}

export const ResolveEmbed = ({
  data,
  leaf,
  highlight,
  ...others
}: ResolveEmbedProps) => {
  if (!data?.detail) {
    return null
  }
  const _isUnfetched =
    !data.detail.mediaType || data.detail.mediaType === MediaTypes.UNFETCHED

  if (_isUnfetched) {
    return (
      <UnfetchedMedia
        atomicId={leaf.atomicId}
        src={data.detail.src}
        highlight={highlight}
      />
    )
  }

  return (
    <IframeComponent
      embedDetail={data.detail}
      highlight={highlight}
      {...others}
    />
  )
}
