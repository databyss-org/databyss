import React, { useState } from 'react'

import { buildDatabyssName } from '@databyss-org/services/catalog/util'
import { buildSourceDetail } from '@databyss-org/services/sources/lib'
import { makeText } from '@databyss-org/services/block/makeText'
import { ModalWindow } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
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
  // update props...
  const { fromCrossref } = metadata
  const { author } = fromCrossref

  // create state
  const state = {
    text: buildDatabyssName({ service: crossref, result: fromCrossref }),
    detail: buildSourceDetail(),
  }

  // update props...

  // ...title
  state.detail.title = makeText(metadata.fromPDF.title.text)

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

// component
const MetadataModal = ({ id, visible, metadata, dismissCallback }) => {
  const [values, setValues] = useState(createValueState(metadata))

  const { hideModal } = useNavigationContext()

  const onDismiss = () => {
    if (dismissCallback) {
      dismissCallback(values)
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
