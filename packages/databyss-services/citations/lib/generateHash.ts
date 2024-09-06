import MurmurHash3 from 'imurmurhash'
import { CitationFormatOptions, SourceDetail } from '../../interfaces'

export const generateHash = (
  source: SourceDetail,
  options: CitationFormatOptions
) => {
  const str = JSON.stringify({
    source,
    options,
  })
  return MurmurHash3(str).result()
}
