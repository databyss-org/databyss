import React from 'react'
import { Text, Grid } from '../'
import DropDownControl from './DropDownControl'

// component
const LabeledDropDownControl = props => {
  const {
    active,
    activeLabelColor,
    dropDownProps,
    gridFlexWrap,
    label,
    labelColor,
    labelProps,
    labelVariant,
    onChange,
    value,
  } = props

  // render methods
  const render = () => (
    <Grid
      singleRow
      alignItems="baseline"
      flexWrap={gridFlexWrap}
      columnGap="small"
    >
      <Text
        variant={labelVariant}
        color={active ? activeLabelColor : labelColor}
        {...labelProps}
      >
        {label}
      </Text>

      <DropDownControl onChange={onChange} value={value} {...dropDownProps} />
    </Grid>
  )

  return render()
}

LabeledDropDownControl.defaultProps = {
  activeLabelColor: 'text.2',
  gridFlexWrap: 'wrap',
  labelColor: 'text.3',
  labelProps: {},
  labelVariant: 'uiTextSmall',
}
export default LabeledDropDownControl
