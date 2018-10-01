import React from 'react'
import { storiesOf } from '@storybook/react'
import { ViewportDecorator } from '../decorators'
import MotifEntries from '../../modules/MotifLanding/MotifEntries'
import MotifEntriesForSource from '../../modules/MotifLanding/MotifEntriesForSource'
import Content from '../../components/Viewport/Content'
import entries from '../../components/Entry/_entries'
import linkedEntries from '../../components/Entry/_linkedEntries'

storiesOf('Motif Entries', module)
  .addDecorator(ViewportDecorator)
  .add('Show All Entries', () => (
    <Content>
      <MotifEntries
        authorName="Jacques Derrida"
        motifName="Abyss"
        entryCount={210}
        sourceCount={42}
        entries={entries}
        linkedEntries={linkedEntries}
      />
    </Content>
  ))
  .add('Entries for Source', () => (
    <Content>
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
    </Content>
  ))
