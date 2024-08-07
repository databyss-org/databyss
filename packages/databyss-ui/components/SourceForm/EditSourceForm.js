import React, { useState } from 'react'
import { cloneDeep } from 'lodash'

import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import {
  Button,
  RawHtml,
  Text,
  TextControl,
  View,
} from '@databyss-org/ui/primitives'
import { CitationStyleOptions } from '@databyss-org/services/citations/constants'
import {
  getCitationStyleOption,
  pruneCitation,
} from '@databyss-org/services/citations/lib'
import {
  isArticle,
  isBook,
  isBookSection,
} from '@databyss-org/services/sources/lib'
import { MonthOptions } from '@databyss-org/services/sources/constants/MonthOptions'
import { PublicationTypes } from '@databyss-org/services/sources/constants/PublicationTypes'
import { SeasonOptions } from '@databyss-org/services/sources/constants/SeasonOptions'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'
import { useCitationContext } from '@databyss-org/services/citations/CitationProvider'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import EditAuthorFields from './EditAuthorFields'
import LabeledDropDownControl from '../../primitives/Control/LabeledDropDownControl'

import MakeLoader from '../Loaders/MakeLoader'
import { useUserPreferencesContext } from '../../hooks'

// consts
const emptyText = { textValue: '', ranges: [] }
const labelProps = { width: '115px' }
const publicationTypeOptions = sortEntriesAtoZ(PublicationTypes, 'label')

// utils
const checkIfArticle = (detail) => {
  if (!detail || !('publicationType' in detail)) {
    return false
  }
  const { publicationType } = detail
  if (!publicationType) {
    return false
  }
  return isArticle(publicationType.id)
}
const checkIfBook = (detail) => {
  if (!detail || !('publicationType' in detail)) {
    return false
  }
  const { publicationType } = detail
  if (!publicationType) {
    return false
  }
  return isBook(publicationType.id)
}
const checkIfBookSection = (detail) => {
  if (!detail || !('publicationType' in detail)) {
    return false
  }
  const { publicationType } = detail
  if (!publicationType) {
    return false
  }
  return isBookSection(publicationType.id)
}
const swap = (array, indexA, indexB) => {
  const b = array[indexA]
  array[indexA] = array[indexB]
  array[indexB] = b
  return array
}

// components
const FormHeading = (props) => (
  <Text variant="uiTextHeading" ml="tiny" mt="medium" mb="small" {...props}>
    {props.children}
  </Text>
)

const LabeledTextInput = (props) => (
  <ValueListItem path={props.path}>
    <TextControl
      labelProps={labelProps}
      gridFlexWrap="nowrap"
      paddingVariant="tiny"
      {...props}
    />
  </ValueListItem>
)

const EditSourceForm = (props) => {
  const { values, onChange } = props

  const { isOnline } = useNotifyContext()
  const { generateCitation } = useCitationContext()
  const {
    getPreferredCitationStyle,
    setPreferredCitationStyle,
  } = useUserPreferencesContext()
  const preferredCitationStyle = getPreferredCitationStyle()

  const [citationStyleOption, setCitationStyleOption] = useState(
    getCitationStyleOption(preferredCitationStyle)
  )

  const hasDetail = 'detail' in values

  const isArticle = checkIfArticle(values.detail)
  const isBook = checkIfBook(values.detail)
  const isBookSection = checkIfBookSection(values.detail)

  // people base methods
  const addPersonTo = (arrayPropName) => {
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
  const canDeleteAuthor = (index) => {
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

  const onDeleteAuthor = (index) => {
    removePersonFrom('authors', index)
  }

  const onMoveAuthorDown = (index) => {
    movePersonDownIn('authors', index)
  }

  const onMoveAuthorUp = (index) => {
    movePersonUpIn('authors', index)
  }

  // editor methods
  const canDeleteEditor = (index) => {
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

  const onDeleteEditor = (index) => {
    removePersonFrom('editors', index)
  }

  const onMoveEditorDown = (index) => {
    movePersonDownIn('editors', index)
  }

  const onMoveEditorUp = (index) => {
    movePersonUpIn('editors', index)
  }

  // translator methods
  const onAddTranslator = () => {
    addPersonTo('translators')
  }

  const onDeleteTranslator = (index) => {
    removePersonFrom('translators', index)
  }

  const onMoveTranslatorDown = (index) => {
    movePersonDownIn('translators', index)
  }

  const onMoveTranslatorUp = (index) => {
    movePersonUpIn('translators', index)
  }

  // citation methods
  const onCitationStyleOptionChange = (value) => {
    setPreferredCitationStyle(value.id)
    setCitationStyleOption(value)
  }

  // render methods
  const renderDatabyssNameSection = () => (
    <>
      <LabeledTextInput
        placeholder="untitled"
        path="text"
        id="name"
        label="Name"
        rich
      />
      <LabeledTextInput
        placeholder="e.g. Jacobson 1975"
        path="name"
        id="shortName"
        label="Short Name"
        rich
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
        dataTestId="edfTitle"
      />

      <LabeledTextInput path="detail.year" id="year" label="Year" />

      {isArticle ? (
        <View marginBottom="10px">
          <ValueListItem path="detail.month">
            <LabeledDropDownControl
              label="Month"
              labelProps={labelProps}
              gridFlexWrap="nowrap"
              paddingVariant="tiny"
              dropDownProps={{
                concatCss: { width: '75%' },
                ctaLabel: 'Choose a month/season',
                itemGroups: [
                  { label: 'Months', items: MonthOptions },
                  { label: 'Seasons', items: SeasonOptions },
                ],
              }}
            />
          </ValueListItem>
        </View>
      ) : null}

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

      {isArticle ? (
        <>
          <LabeledTextInput
            path="detail.journalTitle"
            id="journalTitle"
            label="Journal Title"
            multiline
          />

          <LabeledTextInput
            path="detail.volume"
            id="volume"
            label="Volume"
            multiline
          />

          <LabeledTextInput
            path="detail.issue"
            id="issue"
            label="Issue"
            multiline
          />
        </>
      ) : null}

      {isBookSection ? (
        <LabeledTextInput
          path="detail.chapterTitle"
          id="chapterTitle"
          label="Chapter Title"
          multiline
        />
      ) : null}

      <LabeledTextInput
        path="detail.publisherName"
        id="publisherName"
        label="Publisher"
      />

      <LabeledTextInput
        path="detail.publisherPlace"
        id="publisherPlace"
        label="Place"
        multiline
      />

      <LabeledTextInput path="detail.page" id="page" label="Page(s)" />
    </>
  )

  const renderAuthorsSection = () => {
    if (!hasDetail) {
      return null
    }

    const { authors } = values.detail

    if (!('authors' in values.detail)) {
      console.error('authors prop doesnt exist')
    }

    if (!authors) {
      // FIXME: find a way to add authors
      return null
    }

    const numAuthors = authors.length
    const lastIndex = numAuthors - 1

    return (
      <>
        <FormHeading>Author(s)</FormHeading>

        {authors.map((author, index) => (
          <View marginBottom="10px" key={index}>
            <EditAuthorFields
              firstNamePath={`detail.authors[${index}].firstName`}
              lastNamePath={`detail.authors[${index}].lastName`}
              canMoveDown={index < lastIndex}
              onMoveDown={() => onMoveAuthorDown(index)}
              canMoveUp={index > 0}
              onMoveUp={() => onMoveAuthorUp(index)}
              canDelete={() => canDeleteAuthor(index)}
              onDelete={() => onDeleteAuthor(index)}
            />
          </View>
        ))}

        <View marginTop="5px">
          <Button onPress={onAddAuthor} data-test-button="source-add-author">
            Add Author
          </Button>
        </View>
      </>
    )
  }

  const renderEditorsSection = () => {
    if (!hasDetail) {
      return null
    }

    const { editors } = values.detail

    if (!editors) {
      // FIXME: find a way to add editors
      return null
    }

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
    if (!hasDetail) {
      return null
    }

    const { translators } = values.detail

    if (!translators) {
      // FIXME: find a way to add translators
      return null
    }

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
      {isBook || isBookSection ? (
        <LabeledTextInput path="detail.isbn" id="isbn" label="ISBN" />
      ) : null}
      {/* ISBN END */}

      {/* ISSN */}
      {isArticle ? (
        <LabeledTextInput path="detail.issn" id="issn" label="ISSN" />
      ) : null}
      {/* ISSN END */}

      <LabeledTextInput path="detail.doi" id="doi" label="DOI" />

      <LabeledTextInput path="detail.url" id="url" label="URL" />
    </>
  )

  const renderCitationSection = () => {
    if (!hasDetail) {
      return null
    }

    let _citationStyleOptions = CitationStyleOptions
    // if we're offline, only show the current option and a message to go online
    if (!isOnline) {
      _citationStyleOptions = _citationStyleOptions.filter(
        (option) => option.id === citationStyleOption.id
      )
    }

    const formatOptions = { styleId: preferredCitationStyle }
    const _citation = generateCitation(values.detail, formatOptions, isOnline)

    return (
      <>
        <FormHeading>Citation</FormHeading>

        <View mb="medium" ml="tiny">
          {isOnline || _citation ? (
            <MakeLoader resources={_citation}>
              {(citation) => (
                <RawHtml
                  html={pruneCitation(citation, formatOptions.styleId)}
                />
              )}
            </MakeLoader>
          ) : (
            <Text>Please go online to generate citation</Text>
          )}
        </View>

        <LabeledDropDownControl
          label="Style"
          labelProps={labelProps}
          gridFlexWrap="nowrap"
          paddingVariant="tiny"
          value={citationStyleOption}
          onChange={onCitationStyleOptionChange}
          dropDownProps={{
            concatCss: { width: '75%' },
            ctaLabel: isOnline
              ? 'Choose a citation style'
              : 'Please go online to change the citation style',
            items: _citationStyleOptions,
          }}
        />
      </>
    )
  }

  const render = () => (
    <View
      paddingLeft="none"
      paddingRight="small"
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
