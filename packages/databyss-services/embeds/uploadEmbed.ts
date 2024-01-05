import { uid } from '@databyss-org/data/lib/uid'
import { dbRef } from '@databyss-org/data/pouchdb/dbRef'
import { makeText } from '../blocks'
import { BlockType, Embed } from '../interfaces'
// import { uploadFile } from '../lib/requestDrive'
// import { getAccountId } from '../session/clientStorage'
import { setEmbed } from './setEmbed'
import { mimeTypeToMediaType } from '.'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../databyss-desktop/src/eapi').default

function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16)}`
  )
}

export const uploadEmbed = async (file: File, renameTo?: string) => {
  const _fileId = uid()
  let _filename = file.name
  const ext = _filename.includes('.')
    ? `.${_filename.split('.').slice(-1)}`
    : ''
  if (renameTo) {
    _filename =  renameTo.endsWith(ext) ? renameTo : `${renameTo}${ext}`
  }
  // await uploadFile({ file, fileId })
  await eapi.file.importMedia(file, _fileId, _filename)
  const groupId = dbRef.groupId
  const storageKey = _fileId
  const embed: Embed = {
    _id: _fileId,
    text: makeText(renameTo ?? file.name),
    detail: {
      fileDetail: {
        contentLength: file.size,
        contentType: file.type,
        filename: _filename,
        storageKey,
      },
      mediaType: mimeTypeToMediaType(file.type),
      src: `dbdrive://${groupId}/${_fileId}/${fixedEncodeURIComponent(
        _filename
      )}`,
    },
    type: BlockType.Embed,
  }
  await setEmbed(embed)
  return embed
}
