import React, { useMemo } from 'react'
import { Embed, MediaTypes } from '@databyss-org/services/interfaces/Block'
import { UnfetchedMedia } from './UnfetchedMedia'
import { isHttpInsecure } from './EmbedMedia'
import { IframeComponent } from './Suggest/IframeComponent'
import { ViewProps } from '@databyss-org/ui'

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

  if (isHttpInsecure(data.detail.src)) {
    data.detail.src = `${
      process.env.API_URL
    }/media/proxy?url=${encodeURIComponent(data.detail.src!)}`
  }
  return (
    <IframeComponent
      embedDetail={data.detail}
      highlight={highlight}
      {...others}
    />
  )
}
