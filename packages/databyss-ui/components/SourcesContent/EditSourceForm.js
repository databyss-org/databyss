import React from 'react'

import { Text, TextControl, View } from '@databyss-org/ui/primitives'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'

import { pxUnits } from '../../theming/views'
import LabeledDropDownControl from '../../primitives/Control/LabeledDropDownControl'

// consts
const labelProps = { width: '25%' }
const publicationTypeOptions = [
  { id: 'book', label: 'Book' },
  { id: 'bookSection', label: 'Book Section' },
  { id: 'journalArticle', label: 'Journal Article' },
]

// components
const FormHeading = props => (
  <Text
    variant="uiTextHeading"
    marginTop={pxUnits(20)}
    {...props}
  >
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

const Instructions = props => (
  <Text
    variant="bodySmall"
    {...props}
  >
    {props.children}
  </Text>
)

const EditSourceForm = props => {
  const { values, onChange } = props

  const onTextInputBlur = () => {
    if (values && values.text.textValue.length && onChange) {
      onChange(values)
    }
  }

  // render methods
  const render = () => (
    <View
      paddingLeft="medium"
      paddingRight="medium"
      paddingTop="none"
      paddingBottom="medium"
      backgroundColor="background.0"
      width="100%"
    >
      <ValueListProvider onChange={onChange} values={values}>
        {/* NAME */}
        <FormHeading>Name</FormHeading>
        <Instructions>This is how this entry will show up in Databyss</Instructions>
        <LabeledTextInput
          path="detail.name"
          id="name"
          label="Name"
          rich
          onBlur={onTextInputBlur}
        />
        {/* NAME END */}

        {/* CITATION */}
        <FormHeading>Citation</FormHeading>
        <LabeledTextInput
          path="text"
          id="citation"
          label="Citation"
          onBlur={onTextInputBlur}
          rich
        />
        {/* TODO: render citation dynamically with citeproc-js */}
        {/* <RawHtml html={textToHtml(values.text)} /> */}
        {/* CITATION END */}

        {/* TITLE */}
        <FormHeading>Title</FormHeading>
        <LabeledTextInput
          path="detail.title"
          id="title"
          label="Title"
          onBlur={onTextInputBlur}
        />
        {/* TITLE END */}

        {/* AUTHORS */}
        <FormHeading>Author(s)</FormHeading>
        <LabeledTextInput
          path="detail.authors[0].lastName"
          id="lastName"
          label="Last Name"
          onBlur={onTextInputBlur}
        />
        <LabeledTextInput
          path="detail.authors[0].firstName"
          id="firstName"
          label="First Name"
          onBlur={onTextInputBlur}
        />
        {/* AUTHORS END */}

        {/* PUBLICATION DETAILS */}
        <FormHeading>Publication</FormHeading>
        <LabeledTextInput
          path="detail.yearPublished"
          id="yearPublished"
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
        {/* PUBLICATION DETAILS END */}

        {/* PUBLISHER */}
        <FormHeading>Publisher</FormHeading>
        <LabeledTextInput
          path="detail.publisherName"
          id="publisherName"
          label="Name"
          onBlur={onTextInputBlur}
        />
        <LabeledTextInput
          path="detail.publisherCountry"
          id="publisherCountry"
          label="Country"
          onBlur={onTextInputBlur}
        />
        <LabeledTextInput
          path="detail.publisherCity"
          id="publisherCity"
          label="City"
          onBlur={onTextInputBlur}
        />
        <LabeledTextInput
          path="detail.publisherState"
          id="publisherState"
          label="State"
          onBlur={onTextInputBlur}
        />
        {/* PUBLISHER END */}

        <FormHeading>Catalog Identifiers</FormHeading>
        <LabeledTextInput
          path="detail.isbn"
          id="isbn"
          label="ISBN"
          onBlur={onTextInputBlur}
        />
        <LabeledTextInput
          path="detail.issn"
          id="issn"
          label="ISSN"
          onBlur={onTextInputBlur}
        />
        <LabeledTextInput
          path="detail.doi"
          id="doi"
          label="DOI"
          onBlur={onTextInputBlur}
        />
      </ValueListProvider>
    </View>
  )

  return render()
}

export default EditSourceForm
