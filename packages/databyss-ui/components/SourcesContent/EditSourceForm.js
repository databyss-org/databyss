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

  // people base methods
  const addPersonTo = arrayPropName => {
    // deep clone to be able to modify
    const clone = cloneDeep(values)

    // ensure array exists
    if (!Array.isArray(clone.detail[arrayPropName])) {
      clone.detail[arrayPropName] = []
    }

    // add empty author element
    clone.detail[arrayPropName].push({
      firstName: emptyText,
      lastName: emptyText,
    })

    // dispatch change
    if (onChange) {
      onChange(clone)
    }
  }

  const removePersonFrom = (arrayPropName, index) => {
    // deep clone to be able to modify
    const clone = cloneDeep(values)

    // remove item at index
    clone.detail[arrayPropName].splice(index, 1)

    // dispatch change
    if (onChange) {
      onChange(clone)
    }
  }

  const movePersonIn = (arrayPropName, index, targetIndex) => {
    // deep clone to be able to modify
    const clone = cloneDeep(values)

    // swap items
    clone.detail[arrayPropName] = swap(
      clone.detail[arrayPropName],
      index,
      targetIndex
    )

    // dispatch change
    if (onChange) {
      onChange(clone)
    }
  }

  const movePersonDownIn = (arrayPropName, index) => {
    movePersonIn(arrayPropName, index, index + 1)
  }

  const movePersonUpIn = (arrayPropName, index) => {
    movePersonIn(arrayPropName, index, index - 1)
  }

  // author methods
  const canDeleteAuthor = index => {
    const { authors, editors } = values.detail

    // if there are editors, it's ok to allow to delete all authors
    const numEditors = editors ? editors.length : 0
    if (numEditors > 0) {
      return true
    }

    // prevent deletion if there is only one author left
    return index > 0 || authors.length > 1
  }

  const onAddAuthor = () => {
    addPersonTo('authors')
  }

  const onDeleteAuthor = index => {
    removePersonFrom('authors', index)
  }

  const onMoveAuthorDown = index => {
    movePersonDownIn('authors', index)
  }

  const onMoveAuthorUp = index => {
    movePersonUpIn('authors', index)
  }

  // editor methods
  const canDeleteEditor = index => {
    const { authors, editors } = values.detail

    // if there are authors, it's ok to allow to delete all editors
    if (authors.length > 0) {
      return true
    }

    // prevent deletion if there is only one editor left
    const numEditors = editors ? editors.length : 0
    return index > 0 || numEditors > 1
  }

  const onAddEditor = () => {
    addPersonTo('editors')
  }

  const onDeleteEditor = index => {
    removePersonFrom('editors', index)
  }

  const onMoveEditorDown = index => {
    movePersonDownIn('editors', index)
  }

  const onMoveEditorUp = index => {
    movePersonUpIn('editors', index)
  }

  // translator methods
  const onAddTranslator = () => {
    addPersonTo('translators')
  }

  const onDeleteTranslator = index => {
    removePersonFrom('translators', index)
  }

  const onMoveTranslatorDown = index => {
    movePersonDownIn('translators', index)
  }

  const onMoveTranslatorUp = index => {
    movePersonUpIn('translators', index)
  }

  //
  const onFieldBlur = () => {
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
        onBlur={onFieldBlur}
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
        onBlur={onFieldBlur}
      />

      <LabeledTextInput
        path="detail.year"
        id="year"
        label="Year"
        onBlur={onFieldBlur}
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
        label="Publisher"
        onBlur={onFieldBlur}
      />

      <LabeledTextInput
        path="detail.publisherPlace"
        id="publisherPlace"
        label="Place"
        multiline
        onBlur={onFieldBlur}
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
              onBlur={onFieldBlur}
              canMoveDown={index < lastIndex}
              onMoveDown={() => onMoveAuthorDown(index)}
              canMoveUp={index > 0}
              onMoveUp={() => onMoveAuthorUp(index)}
              canDelete={() => canDeleteAuthor(index)}
              onDelete={() => onDeleteAuthor(index)}
            />
          </View>
        )
      })}

      <View marginTop="5px">
        <Button onPress={onAddAuthor}>Add Author</Button>
      </View>
    </>
  )

  const renderEditorsSection = () => {
    const { editors } = values.detail

    return (
      <>
        <FormHeading>Editor(s)</FormHeading>

        {editors
          ? editors.map((editor, index) => {
              const numEditors = editors.length
              const lastIndex = numEditors - 1
              return (
                <View marginBottom="10px" key={index}>
                  <EditAuthorFields
                    firstNamePath={`detail.editors[${index}].firstName`}
                    lastNamePath={`detail.editors[${index}].lastName`}
                    onBlur={onFieldBlur}
                    canMoveDown={index < lastIndex}
                    onMoveDown={() => onMoveEditorDown(index)}
                    canMoveUp={index > 0}
                    onMoveUp={() => onMoveEditorUp(index)}
                    canDelete={() => canDeleteEditor(index)}
                    onDelete={() => onDeleteEditor(index)}
                  />
                </View>
              )
            })
          : null}

        <View marginTop="5px">
          <Button onPress={onAddEditor}>Add Editor</Button>
        </View>
      </>
    )
  }

  const renderTranslatorsSection = () => {
    const { translators } = values.detail
    return (
      <>
        <FormHeading>Translator(s)</FormHeading>

        {translators
          ? translators.map((translator, index) => {
              const numTransators = translators.length
              const lastIndex = numTransators - 1
              return (
                <View marginBottom="10px" key={index}>
                  <EditAuthorFields
                    firstNamePath={`detail.translators[${index}].firstName`}
                    lastNamePath={`detail.translators[${index}].lastName`}
                    onBlur={onFieldBlur}
                    canMoveDown={index < lastIndex}
                    onMoveDown={() => onMoveTranslatorDown(index)}
                    canMoveUp={index > 0}
                    onMoveUp={() => onMoveTranslatorUp(index)}
                    canDelete
                    onDelete={() => onDeleteTranslator(index)}
                  />
                </View>
              )
            })
          : null}

        <View marginTop="5px">
          <Button onPress={onAddTranslator}>Add Translator</Button>
        </View>
      </>
    )
  }

  const renderCatalogIdentifiersSection = () => (
    <>
      <FormHeading>Catalog Identifiers</FormHeading>

      {/* ISBN */}
      {isBook ? (
        <LabeledTextInput
          path="detail.isbn"
          id="isbn"
          label="ISBN"
          onBlur={onFieldBlur}
        />
      ) : null}
      {/* ISBN END */}

      {/* ISSN */}
      {isArticle ? (
        <LabeledTextInput
          path="detail.issn"
          id="issn"
          label="ISSN"
          onBlur={onFieldBlur}
        />
      ) : null}
      {/* ISSN END */}

      <LabeledTextInput
        path="detail.doi"
        id="doi"
        label="DOI"
        onBlur={onFieldBlur}
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
        onBlur={onFieldBlur}
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

        {renderEditorsSection()}

        {renderTranslatorsSection()}

        {renderCatalogIdentifiersSection()}

        {renderCitationSection()}
      </ValueListProvider>
    </View>
  )

  return render()
}

export default EditSourceForm
