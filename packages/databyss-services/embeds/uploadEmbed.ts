import { uid } from '@databyss-org/data/lib/uid'
import { makeText } from '../blocks'
import { BlockType, MediaTypes } from '../interfaces'
import { uploadFile } from '../lib/requestDrive'
import { getAccountId } from '../session/clientStorage'
import { setEmbed } from './setEmbed'

export const uploadEmbed = async ({
  file,
  sharedWithGroups,
}: {
  file: File
  sharedWithGroups: string[]
}) => {
  const fileId = uid()
  await uploadFile({ file, fileId })
  const groupId = getAccountId()
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
      src: `dbdrive://${groupId}/${fileId}`,
    },
    type: BlockType.Embed,
    sharedWithGroups,
  }
  await setEmbed(embed, true)
  return embed
}
