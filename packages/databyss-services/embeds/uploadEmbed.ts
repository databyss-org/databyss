import { uid } from '@databyss-org/data/lib/uid'
import { dbRef } from '@databyss-org/data/pouchdb/dbRef'
import { makeText } from '../blocks'
import { BlockType, MediaTypes } from '../interfaces'
// import { uploadFile } from '../lib/requestDrive'
// import { getAccountId } from '../session/clientStorage'
import { setEmbed } from './setEmbed'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../databyss-desktop/src/eapi').default

function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16)}`
  )
}

export const uploadEmbed = async (file: File) => {
  const fileId = uid()
  // await uploadFile({ file, fileId })
  await eapi.file.importMedia(file, fileId)
  const groupId = dbRef.groupId
  const storageKey = fileId
  const embed = {
    _id: uid(),
    text: makeText(file.name),
    detail: {
      fileDetail: {
        contentLength: file.size,
        contentType: file.type,
        filename: file.name,
        storageKey,
      },
      mediaType: MediaTypes.IMAGE,
      src: `dbdrive://${groupId}/${fileId}/${fixedEncodeURIComponent(
        file.name
      )}`,
    },
    type: BlockType.Embed,
  }
  await setEmbed(embed)
  return embed
}
