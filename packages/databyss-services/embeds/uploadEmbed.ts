import { uid } from '@databyss-org/data/lib/uid'
import { makeText } from '../blocks'
import { BlockType, Embed, MediaTypes } from '../interfaces'
import { uploadFile } from '../lib/requestDrive'
import { setEmbed } from './setEmbed'

export const uploadEmbed = async (file: File) => {
  const fileId = uid()
  const res = await uploadFile({ file, fileId })
  const embed: Embed = {
    _id: uid(),
    text: makeText(file.name),
    detail: {
      fileDetail: {
        contentLength: file.size,
        contentType: res.contentType ?? file.type,
        filename: file.name,
        storageKey: res.storageKey,
      },
      mediaType: MediaTypes.IMAGE,
      src: `${window.location.protocol}//${window.location.host}/b/${res.storageKey}`,
    },
    type: BlockType.Embed,
  }
  await setEmbed(embed, true)
  return embed
}
