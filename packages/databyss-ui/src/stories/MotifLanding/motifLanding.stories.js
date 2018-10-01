import React from 'react'
import { storiesOf } from '@storybook/react'
import { ViewportDecorator } from '../decorators'
import MotifEntries from '../../modules/MotifLanding/MotifEntries'
import MotifEntriesForSource from '../../modules/MotifLanding/MotifEntriesForSource'
import MotifLanding from '../../modules/MotifLanding/MotifLanding'
import Content from '../../components/Viewport/Content'
import entries from '../../components/Entry/_entries'
import cfAuthors from './_cfauthors'
import sources from './_sources'
// import linkedEntries from '../../components/Entry/_linkedEntries'

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
        source={{
          id: 'SPOM',
          display: 'SPOM',
          title: 'Specters of Marx',
        }}
      />
    </Content>
  ))

const landingProps = {
  author: { firstName: 'Jacques', lastName: 'Derrida', id: 'DD' },
  cfAuthors,
  motif: { name: 'ABYSS', id: 'abyss' },
  entryCount: 210,
  sourceCount: 42,
}
storiesOf('Motif Landing', module)
  .addDecorator(ViewportDecorator)
  .add('Show All Entries', () => (
    <MotifLanding {...landingProps} entries={entries} showAllEntries />
  ))
  .add('Entries for Source', () => (
    <MotifLanding
      {...landingProps}
      entries={entries[0].locations}
      source={{
        id: 'SPOM',
        display: 'SPOM',
        title: 'Specters of Marx',
      }}
    />
  ))
  .add('Source TOC', () => <MotifLanding {...landingProps} sources={sources} />)
