import React, { useState } from 'react'

import { makeText } from '@databyss-org/services/block/makeText'
import { ModalWindow } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import buildSourceDetail from '@databyss-org/services/sources/services/buildSourceDetail'
import CitationProvider from '@databyss-org/services/citations/CitationProvider'
import crossref from '@databyss-org/services/catalog/crossref'

import EditSourceForm from '../../components/SourcesContent/EditSourceForm'

// utils
const createAuthorFromCrossref = crossrefAuthor => ({
  firstName: crossrefAuthor.given
    ? makeText(crossrefAuthor.given)
    : makeText(''),
  lastName: crossrefAuthor.family
    ? makeText(crossrefAuthor.family)
    : makeText(''),
})

const createValueState = metadata => {
  const titleTextControl = makeText(metadata.fromPDF.title.text)

  // create state
  const state = {
    text: titleTextControl,
    detail: buildSourceDetail(),
  }

  // update props...
  const { fromCrossref } = metadata
  const { author } = fromCrossref

  // ...title
  state.detail.title = titleTextControl

  // ...authors
  if (author) {
    author.forEach(a => {
      state.detail.authors.push(createAuthorFromCrossref(a))
    })
  }

  // publication details (common)
  const publicationType = crossref.getPublicationType(fromCrossref)
  state.detail.publisherName = makeText(crossref.getPublisher(fromCrossref))
  state.detail.publisherPlace = makeText(
    crossref.getPublisherPlace(fromCrossref)
  )
  state.detail.year = makeText(crossref.getPublishedYear(fromCrossref))
  state.detail.month = crossref.getPublishedMonth(fromCrossref, publicationType)
  state.detail.volume = makeText(crossref.getVolume(fromCrossref))
  state.detail.issue = makeText(crossref.getIssue(fromCrossref))

  // publication details (book)
  state.detail.isbn = makeText(crossref.getISBN(fromCrossref))

  // publication details (journal article)
  state.detail.doi = makeText(crossref.getDOI(fromCrossref))
  state.detail.issn = makeText(crossref.getISSN(fromCrossref))

  return state
}

const buildResponse = state => {
  const response = {}

  response.title = state.title.textValue

  response.authors = []
  state.authors.forEach(author => {
    response.authors.push({
      firstName: author.firstName.textValue,
      lastName: author.lastName.textValue,
    })
  })

  response.doi = state.doi?.textValue
  response.issn = state.issn?.textValue
  response.year = state.year?.textValue

  return response
}

// component
const MetadataModal = ({ id, visible, metadata, dismissCallback }) => {
  const [values, setValues] = useState(createValueState(metadata))

  const { hideModal } = useNavigationContext()

  const onDismiss = () => {
    if (dismissCallback) {
      const response = buildResponse(values)
      dismissCallback(response)
    }

    hideModal()
  }

  // render methods
  const render = () => (
    <ModalWindow
      visible={visible}
      key={id}
      widthVariant="form"
      onDismiss={onDismiss}
      title="Edit Metadata"
      dismissChild="save"
      canDismiss
    >
      <CitationProvider>
        <EditSourceForm onChange={setValues} values={values} />
      </CitationProvider>
    </ModalWindow>
  )

  return render()
}

export default MetadataModal
