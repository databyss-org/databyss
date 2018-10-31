import React from 'react'
import injectSheet from 'react-jss'
import EntryGroup from './EntryGroup'
import styles from './styles'

const EntriesByLocation = ({ locations, source, renderEntry }) =>
  locations.map((location, _i) => (
    <EntryGroup key={_i} ariaLabel={location.raw}>
      {location.entries.map((entry, __i) =>
        React.cloneElement(
          renderEntry({
            ...entry,
            location: location.raw,
            locationIsRepeat: __i > 0,
            source,
            sourceIsRepeat: _i > 0,
          }),
          { key: __i }
        )
      )}
    </EntryGroup>
  ))

export default injectSheet(styles)(EntriesByLocation)
