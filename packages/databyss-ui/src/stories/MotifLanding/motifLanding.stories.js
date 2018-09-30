import React from 'react'
import { storiesOf } from '@storybook/react'
import { ViewportDecorator } from '../decorators'
import MotifEntries from '../../modules/MotifLanding/MotifEntries'
import MotifEntriesForSource from '../../modules/MotifLanding/MotifEntriesForSource'
import entries from '../../components/Entry/_entries'
import linkedEntries from '../../components/Entry/_linkedEntries'

storiesOf('Motif Entries', module)
  .addDecorator(ViewportDecorator)
  .add('Show All Entries', () => (
    <React.Fragment>
      <MotifEntries
        authorName="Jacques Derrida"
        motifName="Abyss"
        entryCount={210}
        sourceCount={42}
        entries={entries}
        linkedEntries={linkedEntries}
      />
    </React.Fragment>
  ))
  .add('Entries for Source', () => (
    <React.Fragment>
      <MotifEntriesForSource
        authorName="Jacques Derrida"
        motifName="Abyss"
        entryCount={210}
        sourceCount={42}
        entries={entries[0].locations}
        linkedEntries={linkedEntries[0].locations}
        source={{
          id: 'SPOM',
          display: 'SPOM',
          title: 'Specters of Marx',
        }}
      />
    </React.Fragment>
  ))
