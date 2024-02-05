import { flatten, kebabCase } from 'lodash'
import React, { forwardRef, useState } from 'react'
import {
  border,
  color,
  compose,
  flexbox,
  layout,
  position,
  space,
} from 'styled-system'
import { withTheme } from 'emotion-theming'

import { pxUnits } from '../../theming/views'
import { sans } from '../../theming/fonts'

import styled from '../styled'

const defaultProps = {
  backgroundColor: 'background.0',
  borderColor: 'gray.4',
  borderRadius: pxUnits(5),
  borderStyle: 'solid',
  borderWidth: pxUnits(2),
  color: 'text.2',
  cursor: 'pointer',
  fontFamily: sans,
  fontSize: pxUnits(14),
  height: pxUnits(40),
  paddingLeft: pxUnits(10),
}

const styleProps = compose(space, layout, flexbox, border, position, color)
const StyleSelect = styled('select', styleProps)

// utils
const validateItem = (item) => {
  if (!item || !('id' in item) || !('label' in item)) {
    return false
  }
  return true
}

// component
const DropDownControl = withTheme(
  forwardRef((props, ref) => {
    const {
      concatCss,
      ctaLabel,
      items,
      itemGroups,
      onBlur,
      onChange,
      onFocus,
      value,
      theme,
      ...others
    } = props
    const [isFocused, setFocused] = useState(false)

    const defaultCss = {
      backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="292.4" height="292.4"><path fill="${theme.colors.text[2]}" d="M287 69.4a17.6 17.6 0 0 0-13-5.4H18.4c-5 0-9.3 1.8-12.9 5.4A17.6 17.6 0 0 0 0 82.2c0 5 1.8 9.3 5.4 12.9l128 127.9c3.6 3.6 7.8 5.4 12.8 5.4s9.2-1.8 12.8-5.4L287 95c3.5-3.5 5.4-7.8 5.4-12.8 0-5-1.9-9.2-5.5-12.8z"/></svg>`
      )}")`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '.65em auto',
      backgroundPosition: 'right .7em top 50%, 0 0',
      MozAppearance: 'none',
      WebkitAppearance: 'none',
      appearance: 'none',
    }

    // error checks
    if (ctaLabel !== undefined) {
      if (typeof ctaLabel !== 'string') {
        throw new Error(
          '<DropDownControl /> expected the `ctaLabel` prop to be a string.'
        )
      }
    }
    if (!itemGroups) {
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
        items.forEach((item) => {
          if (!validateItem(item)) {
            throw new Error(
              '<DropDownControl /> expected the `items` array to contain elements ' +
                'with both the `id` and the `label` properties.'
            )
          }
        })
      }
    } else {
      if (!Array.isArray(itemGroups)) {
        throw new Error(
          '<DropDownControl /> expected the `itemGroups` prop to be an array.'
        )
      }
      itemGroups.forEach((itemGroup) => {
        if (!('label' in itemGroup) || !('items' in itemGroup)) {
          throw new Error(
            '<DropDownControl /> expected each item of the `itemGroups` property' +
              'to contain both the `label` and the `items` properties.'
          )
        }
        if (!Array.isArray(itemGroup.items)) {
          throw new Error(
            '<DropDownControl /> expected the `items` property ' +
              'of each `itemGroups` entry ' +
              'prop to be an array.'
          )
        }
        itemGroup.items.forEach((item) => {
          if (!validateItem(item)) {
            throw new Error(
              '<DropDownControl /> expected each item group array ' +
                'to contain elements with both the `id` and the `label` properties.'
            )
          }
        })
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
    const getItemByValue = (value) => {
      let itemPool = []
      if (items) {
        itemPool = items
      } else {
        const allItems = []
        itemGroups.forEach((itemGroup) => {
          allItems.push(itemGroup.items)
        })
        itemPool = flatten(allItems)
      }

      /* eslint-disable eqeqeq */
      const response = itemPool.find(
        (item) =>
          // necessary to not use strict equality
          // since type of value may differ from id
          // but comparison is exactly what is needed
          item.id == value
      )
      /* eslint-enable eqeqeq */

      return response
    }

    const getStyles = () => {
      const response = { ...defaultCss }

      if (isFocused) {
        // TODO: find a way to reuse existing styles instead
        Object.assign(response, {
          borderColor: '#6c6ce0',
          // boxShadow: '0 0 0 5px rgba(108, 108, 224, 0.6)',
          outline: 'none',
        })
      }

      if (concatCss) {
        Object.assign(response, concatCss)
      }

      return response
    }

    const getValue = () => {
      if (value && 'id' in value) {
        return value.id
      }

      return undefined
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

    const onInternalChange = (event) => {
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

    const renderItems = (items) =>
      items.map((item) => (
        <option key={item.id} value={item.id} disabled={item.id < 0}>
          {item.label}
        </option>
      ))

    const renderItemGroups = (itemGroups) =>
      itemGroups.map((itemGroup, index) => {
        const itemGroupKey = `${index}-${kebabCase(itemGroup.label)}`
        return (
          <optgroup key={itemGroupKey} label={itemGroup.label}>
            {renderItems(itemGroup.items)}
          </optgroup>
        )
      })

    const renderOptions = () => {
      if (itemGroups) {
        return renderItemGroups(itemGroups)
      }
      return renderItems(items)
    }

    const render = () => (
      <StyleSelect
        ref={ref}
        onChange={onInternalChange}
        onFocus={onInternalFocus}
        onBlur={onInternalBlur}
        css={getStyles()}
        value={getValue()}
        {...defaultProps}
        {...others}
      >
        {renderCTALabel()}
        {renderOptions()}
      </StyleSelect>
    )

    return render()
  })
)

export default DropDownControl
