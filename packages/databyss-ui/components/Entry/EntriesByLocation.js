import React from 'react'
import injectSheet from 'react-jss'
import EntryGroup from './EntryGroup'
import styles from './styles'

const EntriesByLocation = ({ locations, source, children }) =>
  locations.map((location, _i) => (
    <EntryGroup key={_i} ariaLabel={location.raw}>
      {location.entries.map((entry, __i) =>
        React.Children.map(children, child =>
          React.cloneElement(child, {
            ...entry,
            location: location.raw,
            locationIsRepeat: __i > 0,
            source,
            sourceIsRepeat: _i > 0,
          })
        )
      )}
    </EntryGroup>
  ))

export default injectSheet(styles)(EntriesByLocation)
