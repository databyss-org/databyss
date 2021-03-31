import React from 'react'

import { Button, Icon, TextControl, View } from '@databyss-org/ui/primitives'
import { ValueListItem } from '@databyss-org/ui/components/ValueList/ValueListProvider'
import ArrowUpSVG from '@databyss-org/ui/assets/arrowUp.svg'
import ArrowDownSVG from '@databyss-org/ui/assets/arrowDown.svg'
import CrossSVG from '@databyss-org/ui/assets/close.svg'
import styled from '../../primitives/styled'

// consts
const labelProps = { width: '115px' }
const fieldsColMargin = '10px'
const buttonColWidth = '80px'

// styled components
const containerStyles = () => ({
  position: 'relative',
  flexDirection: 'row',
})
const fieldsColStyles = () => ({
  display: 'inline-flex',
  verticalAlign: 'top',
  width: `calc(100% - ${buttonColWidth} - ${fieldsColMargin})`,
  marginRight: fieldsColMargin,
})
const buttonColStyles = () => ({
  alignSelf: 'center',
  display: 'inline-flex',
  flexDirection: 'row',
  position: 'relative',
  width: buttonColWidth,
})
const buttonStyles = () => ({
  display: 'inline-flex',
  position: 'relative',
  textAlign: 'center',
})

const Container = styled(View, containerStyles)
const FieldsCol = styled(View, fieldsColStyles)
const ButtonCol = styled(View, buttonColStyles)
const DeleteButton = styled(Button, buttonStyles)
const ArrowButton = styled(Button, buttonStyles)

// components
const LabeledTextInput = (props) => (
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

const EditAuthorFields = (props) => {
  const {
    canDelete,
    canMoveDown,
    canMoveUp,
    firstNamePath,
    lastNamePath,
    onBlur,
    onDelete,
    onMoveDown,
    onMoveUp,
  } = props

  const isDownDisabled = canMoveDown !== undefined ? !canMoveDown : false
  const isUpDisabled = canMoveUp !== undefined ? !canMoveUp : false
  const isDeleteDisabled = canDelete !== undefined ? !canDelete : false

  const onPressDown = () => {
    if (onMoveDown) {
      onMoveDown()
    }
  }

  const onPressUp = () => {
    if (onMoveUp) {
      onMoveUp()
    }
  }

  const onPressDelete = () => {
    if (onDelete) {
      onDelete()
    }
  }

  const render = () => (
    <Container className="edit-author-fields">
      <FieldsCol className="author-fields-col">
        <LabeledTextInput
          path={lastNamePath}
          id="lastName" // TODO: figure how to make proper unique id
          label="Last Name"
          onBlur={onBlur}
        />
        <LabeledTextInput
          path={firstNamePath}
          id="firstName" // TODO: figure how to make proper unique id
          label="First Name"
          onBlur={onBlur}
        />
      </FieldsCol>

      <ButtonCol className="author-delete-button-col">
        <ArrowButton
          variant="editSource"
          onPress={onPressDown}
          disabled={isDownDisabled}
        >
          <Icon sizeVariant="tiny" color="text.2">
            <ArrowDownSVG />
          </Icon>
        </ArrowButton>

        <ArrowButton
          variant="editSource"
          onPress={onPressUp}
          disabled={isUpDisabled}
        >
          <Icon sizeVariant="tiny" color="text.2">
            <ArrowUpSVG />
          </Icon>
        </ArrowButton>

        <DeleteButton
          variant="editSource"
          onPress={onPressDelete}
          disabled={isDeleteDisabled}
        >
          <Icon sizeVariant="tiny" color="text.2">
            <CrossSVG />
          </Icon>
        </DeleteButton>
      </ButtonCol>
    </Container>
  )

  return render()
}

export default EditAuthorFields
