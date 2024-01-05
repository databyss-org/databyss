import { uid } from '@databyss-org/data/lib/uid'
import { queryMetadataFromCatalog } from '.'
import { makeText } from '../blocks'
import { setEmbed, uploadEmbed } from '../embeds'
import { BlockType, Embed, Source } from '../interfaces'
import { buildSourceDetail, formatSource } from '../sources/lib'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../databyss-desktop/src/eapi').default

/* eslint-disable no-prototype-builtins */
const hasEnoughMetadata = (data) =>
  data.hasOwnProperty('author') || 
  data.hasOwnProperty('title') ||
  data.hasOwnProperty('extractedDOI') ||
  data.hasOwnProperty('extractedTitle')
/* eslint-enable no-prototype-builtins */

function buildSourceBlock(data: Source | string, embed: Embed) {
  const block: Source = {
    ...(typeof data === 'string'
      ? { detail: buildSourceDetail(), text: makeText(data) }
      : data),
    type: BlockType.Source,
    _id: uid(),
    media: [embed._id],
  }
  console.log('[ProcessPDF] source', block)
  return block
}

export async function processPDF(file: File) {
  let _entryBlock: Source
  // parse pdf annotations and metadata
  let _source: Source | null = null
  const _embed: Embed = await uploadEmbed(file, file.name)
  // console.log('[DropZoneManager] embed', _embed)
  const response = await eapi.pdf.parse(_embed.detail?.src)
  const _title = response.metadata?.title?.text ?? file.name
  if (hasEnoughMetadata(response.metadata)) {
    _source = await queryMetadataFromCatalog(response.metadata)
  }
  if (_source) {
    _entryBlock = buildSourceBlock(formatSource(_source!), _embed)
  } else {
    console.warn(
      'Not enough PDF metadata to attempt to get additional info from Crossref.'
    )
    _entryBlock = buildSourceBlock(_title, _embed)
  }
  if (_entryBlock.text.textValue !== file.name) {
    let _filename = `${_entryBlock.text.textValue}.pdf`
    _filename = await eapi.file.renameMedia(_embed._id, _filename)
    _embed.detail.fileDetail!.filename = _filename
    _embed.detail.src = _embed.detail.src.split('/').slice(0, -1).concat(_filename).join('/')
    // console.log('[DropZoneManager] renamed embed', _embed)
    await setEmbed(_embed)
  }
  return {
    source: _entryBlock,
    embed: _embed,
    metadata: response.metadata,
    annotations: response.annotations,
    catalogQueryResults: _source
  }
}