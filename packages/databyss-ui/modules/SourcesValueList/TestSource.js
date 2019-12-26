import React, { useState, useEffect } from 'react'
import ValueListProvider, {
  ValueListItem,
} from '@databyss-org/ui/components/ValueList/ValueListProvider'
import { withSource } from '@databyss-org/services/sources/SourceProvider'
import { View, Grid, TextControl, List } from '@databyss-org/ui/primitives'
import _ from 'lodash'

const ControlList = ({ children, ...others }) => (
  <List horizontalItemPadding="small" {...others}>
    {children}
  </List>
)

const SourcesValueList = ({ source, onValueChange, onValueBlur }) => {
  const [values, setValues] = useState(source)

  // useEffect(() => {
  //   console.log('mounted')
  //   onValueChange(source)

  //   //  console.log(source)
  // }, [])

  const onChange = _value => {
    onValueChange(_value)
    setValues(_value)
    // if (!_.isEqual(_value, values) && values) {
    //   onValueChange(_value)
    // }
  }

  const onBlur = () => {
    onValueBlur()
    // if (!_.isEqual(source, values) && values) {
    //    onValueChange(values)
    // }
  }

  const onInputChange = event => {
    console.log(event.target.value)

    //   setTexst(event.target.value)
  }
  return (
    <div>
      <input
        value={source.text.textValue}
        onChange={e =>
          onValueChange({
            ...source,
            text: { textValue: e.target.value },
          })
        }
      />

      <input
        value={source.authors[0].firstName.textValue}
        onChange={e =>
          onValueChange({
            ...source,
            authors: [{ firstName: { textValue: e.target.value } }],
          })
        }
      />
    </div>
  )
}

export default withSource(SourcesValueList)
