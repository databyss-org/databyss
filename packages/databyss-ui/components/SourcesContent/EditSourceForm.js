import React from 'react'
import { cloneDeep } from 'lodash'

import { Button, Text, TextControl, View } from '@databyss-org/ui/primitives'
import { PublicationTypeId } from '@databyss-org/services/citations/constants/PublicationTypeId'
import { PublicationTypes } from '@databyss-org/services/citations/constants/PublicationTypes'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
import EditAuthorFields from '@databyss-org/ui/components/SourcesContent/EditAuthorFields'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'

import { pxUnits } from '../../theming/views'
import LabeledDropDownControl from '../../primitives/Control/LabeledDropDownControl'

// consts
const labelProps = { width: '115px' }
const publicationTypeOptions = sortEntriesAtoZ(PublicationTypes, 'label')
const emptyText = { textValue: '', ranges: [] }

// utils
const checkIfBook = option => {
  if (!option) {
    return false
  }
  return (
    option.id === PublicationTypeId.BOOK ||
    option.id === PublicationTypeId.BOOK_SECTION
  )
}
const checkIfArticle = option => {
  if (!option) {
    return false
  }
  return (
    option.id === PublicationTypeId.JOURNAL_ARTICLE ||
    option.id === PublicationTypeId.NEWSPAPER_ARTICLE ||
    option.id === PublicationTypeId.MAGAZINE_ARTICLE
  )
}
const swap = (array, indexA, indexB) => {
  const b = array[indexA]
  array[indexA] = array[indexB]
  array[indexB] = b
  return array
}

// components
const FormHeading = props => (
  <Text variant="uiTextHeading" marginTop={pxUnits(20)} {...props}>
    {props.children}
  </Text>
)

const LabeledTextInput = props => (
  <ValueListItem path={props.path}>
    <TextControl
      labelProps={labelProps}
      label={props.label}
      id={props.id}
      gridFlexWrap="nowrap"
      paddingVariant="tiny"
      onBlur={props.onBlur}
      {...props}
    />
  </ValueListItem>
)

const EditSourceForm = props => {
  const { values, onChange } = props

  const isBook = checkIfBook(values.detail.publicationType)
  const isArticle = checkIfArticle(values.detail.publicationType)

  const onAddAuthor = () => {
    // deep clone to be able to modify
    const clone = cloneDeep(values)

    // add empty author element
    clone.detail.authors.push({
      firstName: emptyText,
      lastName: emptyText,
    })

    // dispatch change
    if (onChange) {
      onChange(clone)
    }
  }

  const onMoveDown = index => {
    // deep clone to be able to modify
    const clone = cloneDeep(values)

    // swap items
    const targetIndex = index + 1
    clone.detail.authors = swap(clone.detail.authors, index, targetIndex)

    // dispatch change
    if (onChange) {
      onChange(clone)
    }
  }

  const onMoveUp = index => {
    // deep clone to be able to modify
    const clone = cloneDeep(values)

    // swap items
    const targetIndex = index - 1
    clone.detail.authors = swap(clone.detail.authors, index, targetIndex)

    // dispatch change
    if (onChange) {
      onChange(clone)
    }
  }

  const onDeleteAuthor = index => {
    // deep clone to be able to modify
    const clone = cloneDeep(values)

    // remove item at index
    clone.detail.authors.splice(index, 1)

    // dispatch change
    if (onChange) {
      onChange(clone)
    }
  }

  const onTextInputBlur = () => {
    if (values && values.text.textValue.length && onChange) {
      onChange(values)
    }
  }

  // render methods
  const renderDatabyssNameSection = () => (
    <>
      <FormHeading>Databyss Name</FormHeading>
      <LabeledTextInput
        path="text"
        id="name"
        label="Name"
        rich
        onBlur={onTextInputBlur}
      />
    </>
  )

  const renderPublicationSection = () => (
    <>
      <FormHeading>Publication</FormHeading>

      <LabeledTextInput
        path="detail.title"
        id="title"
        label="Title"
        multiline
        onBlur={onTextInputBlur}
      />

      <LabeledTextInput
        path="detail.year"
        id="year"
        label="Year Published"
        onBlur={onTextInputBlur}
      />

      <ValueListItem path="detail.publicationType">
        <LabeledDropDownControl
          label="Publication type"
          labelProps={labelProps}
          gridFlexWrap="nowrap"
          paddingVariant="tiny"
          dropDownProps={{
            concatCss: { width: '75%' },
            ctaLabel: 'Choose a type',
            items: publicationTypeOptions,
          }}
        />
      </ValueListItem>

      <LabeledTextInput
        path="detail.publisherName"
        id="publisherName"
        label="Publisher Name"
        onBlur={onTextInputBlur}
      />

      <LabeledTextInput
        path="detail.publisherPlace"
        id="publisherPlace"
        label="Place"
        multiline
        onBlur={onTextInputBlur}
      />
    </>
  )

  const renderAuthorsSection = () => (
    <>
      <FormHeading>Author(s)</FormHeading>

      {values.detail.authors.map((author, index) => {
        const numAuthors = values.detail.authors.length
        const lastIndex = numAuthors - 1
        return (
          <View marginBottom="10px" key={index}>
            <EditAuthorFields
              firstNamePath={`detail.authors[${index}].firstName`}
              lastNamePath={`detail.authors[${index}].lastName`}
              onBlur={onTextInputBlur}
              canMoveDown={index < lastIndex}
              onMoveDown={() => onMoveDown(index)}
              canMoveUp={index > 0}
              onMoveUp={() => onMoveUp(index)}
              canDelete={index > 0 || numAuthors > 1}
              onDelete={() => onDeleteAuthor(index)}
            />
          </View>
        )
      })}

      <View marginTop="5px">
        <Button onPress={onAddAuthor}>Add author</Button>
      </View>
    </>
  )

  const renderCatalogIdentifiersSection = () => (
    <>
      <FormHeading>Catalog Identifiers</FormHeading>

      {/* ISBN */}
      {isBook ? (
        <LabeledTextInput
          path="detail.isbn"
          id="isbn"
          label="ISBN"
          onBlur={onTextInputBlur}
        />
      ) : null}
      {/* ISBN END */}

      {/* ISSN */}
      {isArticle ? (
        <LabeledTextInput
          path="detail.issn"
          id="issn"
          label="ISSN"
          onBlur={onTextInputBlur}
        />
      ) : null}
      {/* ISSN END */}

      <LabeledTextInput
        path="detail.doi"
        id="doi"
        label="DOI"
        onBlur={onTextInputBlur}
      />
    </>
  )

  const renderCitationSection = () => (
    <>
      <FormHeading>Citation</FormHeading>
      <LabeledTextInput
        path="detail.citation"
        id="citation"
        label="Citation"
        onBlur={onTextInputBlur}
        rich
      />
      {/* TODO: render citation dynamically with citeproc-js */}
      {/* <RawHtml html={textToHtml(values.text)} /> */}
    </>
  )

  const render = () => (
    <View
      paddingLeft="medium"
      paddingRight="medium"
      paddingTop="none"
      paddingBottom="medium"
      width="100%"
      backgroundColor="background.0"
    >
      <ValueListProvider onChange={onChange} values={values}>
        {renderDatabyssNameSection()}

        {renderPublicationSection()}

        {renderAuthorsSection()}

        {renderCatalogIdentifiersSection()}

        {renderCitationSection()}
      </ValueListProvider>
    </View>
  )

  return render()
}

export default EditSourceForm
