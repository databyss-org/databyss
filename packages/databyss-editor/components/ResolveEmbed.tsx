import React, { useState } from 'react'
import {
  Embed,
  EmbedDetail,
  MediaTypes,
} from '@databyss-org/services/interfaces/Block'
import { ViewProps } from '@databyss-org/ui'
import { UnfetchedMedia } from './UnfetchedMedia'
import { IframeComponent } from './Suggest/IframeComponent'
import { getFileUrl } from '@databyss-org/data/drivedb/files'
import { LoadingFallback } from '@databyss-org/ui/components'

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
  const [detail, setDetail] = useState<EmbedDetail>(data?.detail)
  const [isFetching, setIsFetching] = useState(false)
  if (!detail) {
    return null
  }
  const _isUnfetched =
    !detail.mediaType || detail.mediaType === MediaTypes.UNFETCHED

  if (_isUnfetched) {
    return (
      <UnfetchedMedia
        atomicId={leaf.atomicId}
        src={detail.src}
        highlight={highlight}
      />
    )
  }

  if (detail?.src?.startsWith('dbdrive://')) {
    if (!isFetching) {
      const [, , _groupId, _fileId] = detail.src.split('/')
      getFileUrl(_groupId, _fileId).then((url) => {
        setDetail({ ...detail, src: url })
      })
      setIsFetching(true)
    }
    return <LoadingFallback />
  }

  return (
    <IframeComponent embedDetail={detail} highlight={highlight} {...others} />
  )
}
