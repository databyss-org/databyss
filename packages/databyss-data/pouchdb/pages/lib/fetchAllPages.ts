import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { PageDoc, DocumentType } from '../../interfaces'
import { findAll } from '../../crudUtils'

const fetchAllPages = async (): Promise<PageDoc[] | ResourceNotFoundError> => {
  const _pages = await findAll({
    doctype: DocumentType.Page,
    useIndex: 'fetch-all',
  })

  if (!_pages.length) {
    return new ResourceNotFoundError('no pages found')
  }
  return _pages
}

export default fetchAllPages
