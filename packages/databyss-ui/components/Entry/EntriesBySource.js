import React from 'react'
import injectSheet from 'react-jss'
import EntryGroup from './EntryGroup'
import EntriesByLocation from './EntriesByLocation'
import styles from './styles'

const EntriesBySource = ({ sources, renderEntry }) => (
  <React.Fragment>
    {sources.map((source, i) => (
      <EntryGroup key={i} ariaLabel={source.title}>
        <EntriesByLocation
          locations={source.locations}
          source={source}
          renderEntry={renderEntry}
        />
      </EntryGroup>
    ))}
  </React.Fragment>
)

export default injectSheet(styles)(EntriesBySource)
