import React, { useState } from 'react'
import {
  Embed,
  EmbedDetail,
  MediaTypes,
} from '@databyss-org/services/interfaces/Block'
import { ViewProps } from '@databyss-org/ui'
import { getFileUrl } from '@databyss-org/data/drivedb/files'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { LoadingFallback } from '@databyss-org/ui/components'
import { getAccountId } from '@databyss-org/services/session/clientStorage'
import { UnfetchedMedia } from './UnfetchedMedia'
import { IframeComponent } from './Suggest/IframeComponent'

interface ResolveEmbedProps extends ViewProps {
  data: Embed
  highlight?: boolean
}

export const ResolveEmbed = ({
  data,
  highlight = false,
  ...others
}: ResolveEmbedProps) => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const getCurrentAccount = useSessionContext((c) => c && c.getCurrentAccount)
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
        atomicId={data._id}
        src={detail.src}
        highlight={highlight}
      />
    )
  }

  if (detail?.src?.startsWith('dbdrive://')) {
    if (isPublicAccount()) {
      // Return the remote drive URL so that the browser can load it over HTTP
      const _groupId = getCurrentAccount()
      detail.src = `https://${process.env.DRIVE_HOST}/b/${_groupId}/${detail.fileDetail?.storageKey}`
    } else {
      if (!isFetching) {
        const _groupId = getAccountId()
        const _fileId = detail.fileDetail?.storageKey
        getFileUrl(_groupId, _fileId).then((url) => {
          setDetail({ ...detail, src: url })
        })
        setIsFetching(true)
      }
      return <LoadingFallback />
    }
  }

  return (
    <IframeComponent embedDetail={detail} highlight={highlight} {...others} />
  )
}
