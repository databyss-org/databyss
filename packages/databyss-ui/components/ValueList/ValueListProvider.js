import React, { createContext, useContext } from 'react'
import cloneDeep from 'clone-deep'
import _ from 'lodash'

/**
 * ValueListProvider creates a controlled (two-way) binding between an object
 * of shape { key0: value0, key1: value1, ... } and a context
 * that can be consumed by ValueListItem.
 * Values in the bound object can be literals, arrays or objects
 */
export const ValueListContext = createContext()

// values is dicitonary
export const ValueListProvider = ({ children, values, onChange }) => {
  const onItemChange = (path, value) => {
    // apply changes to values, cloned to preserve immutability
    const _values = cloneDeep(values)
    // lodash.set:
    // Sets the value at path of object.
    // If a portion of path doesn't exist, it's created.
    // https://lodash.com/docs/4.17.15#set

    _.set(_values, path, value)

    // pass updated values to parent handler
    // also pass the path in case the handler wants to know where the change
    // occurred
    onChange(_values)
  }
  return (
    <ValueListContext.Provider value={[onItemChange, values]}>
      {children}
    </ValueListContext.Provider>
  )
}
export const useValueListContext = () => useContext(ValueListContext)

/**
 * ValueListItem consumes a ValueListContext to bind values and
 * onChange of its child
 */

export const ValueListItem = ({ children, path, ...others }) => {
  const [onItemChange, values] = useValueListContext()

  const value = _.get(values, path)

  // lodash.get:
  // Gets the value at path of object.
  // If the resolved value is undefined, the defaultValue is returned in its place.
  // https://lodash.com/docs/4.17.15#get

  return React.cloneElement(React.Children.only(children), {
    value,
    onChange: _value => onItemChange(path, _value),
    ...others,
  })
}

export default ValueListProvider
