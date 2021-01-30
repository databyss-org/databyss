import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { PageDoc, DocumentType } from '../../interfaces'
import { findAll } from '../../utils'

const fetchAllPages = async (): Promise<PageDoc[] | ResourceNotFoundError> => {
  const _pages = await findAll(DocumentType.Page)

  if (!_pages.length) {
    return new ResourceNotFoundError('no pages found')
  }
  return _pages
}

export default fetchAllPages
