import { Embed, MediaTypes } from '../interfaces'
import { Metadata, fetchAnnotations, fileIsPDF } from '../pdf'
import { uploadEmbed } from './uploadEmbed'

export { setEmbed } from './setEmbed'
export { parseTweetUrl } from './twitter'
export { uploadEmbed } from './uploadEmbed'

export function mimeTypeToMediaType(mime: string) {
  const [mimeType] = mime.split('/')

  switch (mimeType) {
    case 'image':
      return MediaTypes.IMAGE
  }
  switch (mime) {
    case 'application/pdf':
      return MediaTypes.PDF
  }

  return MediaTypes.UNKNOWN
}

export const importEmbed = async (file: File, metadata?: Metadata) => {
  let _filename = file.name
  if (metadata?.title) {
    _filename = metadata.title.text
  }
  console.log('[importEmbed] filename', _filename)
  const _embed: Embed = await uploadEmbed(file, _filename)
  return _embed
}
