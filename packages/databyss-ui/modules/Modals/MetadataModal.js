import React, { useState } from 'react'

import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import {
  ModalWindow,
  View,
  Grid,
  Text,
  TextControl,
  List,
} from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'

import styled from '../../primitives/styled'

// utils
const createTextControl = textValue => ({
  textValue,
  ranges: [],
})

const createAuthorFromCrossref = crossrefAuthor => ({
  firstName: crossrefAuthor.given
    ? createTextControl(crossrefAuthor.given)
    : createTextControl(''),
  lastName: crossrefAuthor.family
    ? createTextControl(crossrefAuthor.family)
    : createTextControl(''),
})

const createValueState = metadata => {
  const state = {
    title: createTextControl(metadata.fromPDF.title.text),
    authors: [],
  }

  const { author, DOI, ISSN } = metadata.fromCrossref
  if (author) {
    author.forEach(a => {
      state.authors.push(createAuthorFromCrossref(a))
    })
  }
  if (DOI) {
    state.doi = createTextControl(DOI)
  }
  if (ISSN) {
    state.issn = createTextControl(ISSN[0])
    if (ISSN.length > 1) {
      state.issnList = ISSN
    }
  }
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

  response.doi = state.doi.textValue
  response.issn = state.issn.textValue
  response.year = state.year.textValue

  return response
}

// styled components
const legendStyles = () => ({
  marginTop: '15px',
})

const Legend = styled(Text, legendStyles)

// components
const ControlList = ({ children, ...others }) => (
  <List horizontalItemPadding="small" {...others}>
    {children}
  </List>
)

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
  const renderAuthorFields = () => {
    const labelStr = values.authors.length > 1 ? 'Authors' : 'Author'
    return (
      <View>
        <Legend variant="uiTextNormalSemibold">{labelStr}</Legend>
        {values.authors.map((author, index) => (
          <div key={index}>
            <ValueListItem path={`authors[${index}].firstName`}>
              <TextControl
                labelProps={{ width: '25%' }}
                label="First Name"
                id="firstName"
                gridFlexWrap="nowrap"
                paddingVariant="tiny"
                rich
              />
            </ValueListItem>
            <ValueListItem path={`authors[${index}].lastName`}>
              <TextControl
                labelProps={{ width: '25%' }}
                label="Last Name"
                id="lastName"
                gridFlexWrap="nowrap"
                paddingVariant="tiny"
                rich
              />
            </ValueListItem>
          </div>
        ))}
      </View>
    )
  }

  const renderISSNFields = () => {
    // if (values.issnList && values.issnList.length > 1) {
      // TODO: render drop down menu instead?
    // }

    return (
      <ValueListItem path="issn">
        <TextControl
          labelProps={{ width: '25%' }}
          label="ISSN"
          id="issn"
          gridFlexWrap="nowrap"
          paddingVariant="tiny"
          rich
        />
      </ValueListItem>
    )
  }

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
      <ValueListProvider onChange={setValues} values={values}>
        <Grid>
          <View
            paddingVariant="none"
            widthVariant="content"
            backgroundColor="background.0"
            width="100%"
          >
            <ControlList verticalItemPadding="tiny">
              <ValueListItem path="title">
                <TextControl
                  labelProps={{ width: '25%' }}
                  label="Name"
                  id="name"
                  gridFlexWrap="nowrap"
                  focusOnMount
                  paddingVariant="tiny"
                  rich
                />
              </ValueListItem>
              {renderAuthorFields()}
              <Legend variant="uiTextNormalSemibold">Metadata</Legend>
              <ValueListItem path="year">
                <TextControl
                  labelProps={{ width: '25%' }}
                  label="Year Published"
                  id="year"
                  gridFlexWrap="nowrap"
                  paddingVariant="tiny"
                  rich
                />
              </ValueListItem>
              <ValueListItem path="doi">
                <TextControl
                  labelProps={{ width: '25%' }}
                  label="DOI"
                  id="doi"
                  gridFlexWrap="nowrap"
                  paddingVariant="tiny"
                  rich
                />
              </ValueListItem>
              {renderISSNFields()}
            </ControlList>
          </View>
        </Grid>
      </ValueListProvider>
    </ModalWindow>
  )

  return render()
}

export default MetadataModal
