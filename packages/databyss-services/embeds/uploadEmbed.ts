import { uid } from '@databyss-org/data/lib/uid'
import { makeText } from '../blocks'
import { BlockType, Embed, MediaTypes } from '../interfaces'
import { uploadFile } from '../lib/requestDrive'
import { getAccountId } from '../session/clientStorage'
import { setEmbed } from './setEmbed'

export const uploadEmbed = async (file: File) => {
  const fileId = uid()
  await uploadFile({ file, fileId })
  const groupId = await getAccountId()
  const storageKey = `${groupId}/${fileId}`
  const embed: Embed = {
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
      src: `dbdrive://${storageKey}`,
    },
    type: BlockType.Embed,
  }
  await setEmbed(embed, true)
  return embed
}
