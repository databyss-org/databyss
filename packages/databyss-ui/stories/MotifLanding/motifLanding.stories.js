import React from 'react'
import { storiesOf } from '@storybook/react'
import { ViewportDecorator } from '../decorators'
import MotifEntries from '../../modules/MotifLanding/MotifEntries'
// import MotifSources from '../../modules/MotifLanding/MotifSources'
import EntriesBySource from '../../components/Entry/EntriesBySource'
import Entry from '../../components/Entry/Entry'
import MotifLanding from '../../modules/MotifLanding/MotifLanding'
import entriesBySource from '../../components/Entry/_entries'
import cfAuthors from './_cfauthors'
// import sources from './_sources'

const landingProps = {
  author: { firstName: 'Jacques', lastName: 'Derrida', id: 'DD' },
  cfAuthors,
  motif: { name: 'ABYSS', id: 'abyss' },
  entryCount: 210,
  sourceCount: 42,
  contentTitle:
    'Databyss includes 210 entries of the motif “ABYSS” from 42 sources by Jacques Derrida',
}
storiesOf('Motif Landing', module)
  .addDecorator(ViewportDecorator)
  .add('Show All Entries', () => (
    <MotifLanding {...landingProps}>
      <MotifEntries>
        <EntriesBySource sources={entriesBySource}>
          <Entry />
        </EntriesBySource>
      </MotifEntries>
    </MotifLanding>
  ))
// .add('Entries for Source', () => (
//   <MotifLanding
//     {...landingProps}
//     entries={entries[0].locations}
//     source={{
//       id: 'SPOM',
//       display: 'SPOM',
//       title: 'Specters of Marx',
//     }}
//   />
// ))
// .add('Source TOC', () => <MotifLanding {...landingProps} sources={sources} />)
