import React, { forwardRef, useState } from 'react'

import { pxUnits } from '../../theming/views'
import { sans } from '../../theming/fonts'

import styled from '../styled'

/*
interface DropDownControlItem {
  label: string
  id: string
}

interface DropDownControlProps {
  concatCss: object
  ctaLabel?: string
  items: DropDownControlItem[]
  ...others
}
*/

// styled components
const selectStyles = () => ({
  MozAppearance: 'none',
  WebkitAppearance: 'none',
  appearance: 'none',

  backgroundColor: 'white',
  backgroundImage:
    'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2312100C%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
  backgroundPosition: 'right .7em top 50%, 0 0',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '.65em auto',
  borderColor: 'gray.4',
  borderRadius: pxUnits(5),
  borderStyle: 'solid',
  borderWidth: pxUnits(2),
  color: 'black',
  cursor: 'pointer',
  fontFamily: sans,
  fontSize: pxUnits(14),
  height: pxUnits(40),
  paddingLeft: pxUnits(10),
})

const StyleSelect = styled('select', selectStyles)

// component
const DropDownControl = forwardRef((props, ref) => {
  const {
    concatCss,
    ctaLabel,
    items,
    onBlur,
    onChange,
    onFocus,
    value,
    ...others
  } = props
  const [isFocused, setFocused] = useState(false)

  // error checks
  if (ctaLabel !== undefined) {
    if (typeof ctaLabel !== 'string') {
      throw new Error(
        '<DropDownControl /> expected the `ctaLabel` prop to be a string.'
      )
    }
  }
  if (!items) {
    throw new Error(
      '<DropDownControl /> expected `items`, an array of items, ' +
        'but none was provided.'
    )
  }
  if (items !== undefined) {
    if (!Array.isArray(items)) {
      throw new Error(
        '<DropDownControl /> expected the `items` prop to be an array.'
      )
    }
    items.forEach(item => {
      /* eslint-disable no-prototype-builtins */
      if (!item.hasOwnProperty('id') || !item.hasOwnProperty('label')) {
        throw new Error(
          '<DropDownControl /> expected the `items` array to contain elements ' +
            'with both the `id` and the `label` properties.'
        )
      }
      /* eslint-enable no-prototype-builtins */
    })
  }
  if (concatCss !== undefined) {
    if (typeof concatCss !== 'object') {
      throw new Error(
        '<DropDownControl /> expected the `concatCss` prop to be an object containing css properties.'
      )
    }
  }

  // utils
  const getItemByValue = value => items.find(item => item.id === value)

  const getStyles = () => {
    const response = {}

    if (isFocused) {
      // TODO: find a way to reuse existing styles instead
      Object.assign(response, {
        borderColor: '#6c6ce0',
        boxShadow: '0 0 0 5px rgba(108, 108, 224, 0.6)',
        outline: 'none',
      })
    }

    if (concatCss) {
      Object.assign(response, concatCss)
    }

    return response
  }

  // events
  const onInternalFocus = () => {
    setFocused(true)
    if (onFocus) {
      onFocus()
    }
  }

  const onInternalBlur = () => {
    setFocused(false)
    if (onBlur) {
      onBlur()
    }
  }

  const onInternalChange = event => {
    if (onChange) {
      const { target } = event
      const item = getItemByValue(target.value)
      onChange(item)
    }
  }

  // render methods
  const renderCTALabel = () => {
    if (!ctaLabel) {
      return null
    }

    return (
      <option value="" disabled>
        {ctaLabel}
      </option>
    )
  }

  const renderOptions = () =>
    props.items.map(item => (
      <option key={item.id} value={item.id}>
        {item.label}
      </option>
    ))

  const render = () => (
    <StyleSelect
      ref={ref}
      onChange={onInternalChange}
      onFocus={onInternalFocus}
      onBlur={onInternalBlur}
      css={getStyles()}
      value={value.id}
      {...others}
    >
      {renderCTALabel()}
      {renderOptions()}
    </StyleSelect>
  )

  return render()
})

export default DropDownControl
