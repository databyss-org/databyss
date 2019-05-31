import React from 'react'
import { storiesOf } from '@storybook/react'
import { ViewportDecorator } from '../decorators'
import Raw from '../../components/Viewport/Raw'
import Link from '../../components/Navigation/Link'
import Entries from '../../modules/Landing/Entries'
import Sources from '../../modules/Landing/Sources'
import EntriesBySource from '../../components/Entry/EntriesBySource'
import EntriesByLocation from '../../components/Entry/EntriesByLocation'
import Entry from '../../components/Entry/Entry'
import Landing from '../../modules/Landing/Landing'
import entriesBySource from '../../components/Entry/_entries'
import cfList from './_cfauthors'
import sources from './_sources'

const landingProps = {
  cfList,
  title: 'Jacques Derrida on “ABYSS”',
  renderCfItem: cf => (
    <Link key={cf.id} href={`/motif/abyss:${cf.id}`}>
      {cf.lastName}
    </Link>
  ),
}
const landingPropsLong = {
  cfList,
  title:
    'acques Derrida on HIEROGLYPH / PASIGRAPHY / LEIBNIZ / CHINESE / UNIVERSAL LANGUAGE',
  renderCfItem: cf => (
    <Link key={cf.id} href={`/motif/abyss:${cf.id}`}>
      {cf.lastName}
    </Link>
  ),
}
storiesOf('Motif Landing', module)
  .addDecorator(ViewportDecorator)
  .add('Show All Entries', () => (
    <Landing
      {...landingProps}
      contentTitle="Databyss includes 210 entries of the motif “ABYSS” from 42 sources by Jacques Derrida"
      withToggle
    >
      <Entries>
        <EntriesBySource
          sources={entriesBySource}
          renderEntry={entry => <Entry {...entry} />}
        />
      </Entries>
    </Landing>
  ))
  .add('Entries for Source', () => (
    <Landing
      {...landingProps}
      contentTitle={'210 entries for “Abyss” in Specters of Marx'}
      subtitle={'in Specters of Marx'}
      withToggle
    >
      <Entries>
        <EntriesByLocation
          locations={entriesBySource[0].locations}
          renderEntry={entry => <Entry {...entry} />}
        />
      </Entries>
    </Landing>
  ))
  .add('Entries for Source (long title)', () => (
    <Landing
      {...landingPropsLong}
      contentTitle={
        'Databyss includes 210 entries of the motif “ABYSS” from 42 sources by Jacques Derrida'
      }
      subtitle={'in Of Grammatology'}
      withToggle
    >
      <Entries>
        <EntriesByLocation
          locations={entriesBySource[0].locations}
          renderEntry={entry => <Entry {...entry} />}
        />
      </Entries>
    </Landing>
  ))
  .add('Source TOC', () => (
    <Landing
      {...landingProps}
      contentTitle="Databyss includes 210 entries of the motif “ABYSS” from 44 sources by Jacques Derrida"
    >
      <Sources
        sources={sources}
        renderSource={source => (
          <Link href={`/motif/abyss/${source.id}`}>
            <Raw
              html={`${source.title}${
                source.entryCount ? ` (${source.entryCount})` : null
              }`}
            />
          </Link>
        )}
      />
    </Landing>
  ))
