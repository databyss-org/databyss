import React from 'react'
import { storiesOf } from '@storybook/react'
import Raw from '@databyss-org/ui/components/Viewport/Raw'
import Link from '@databyss-org/ui/components/Navigation/Link'
import Entries from '@databyss-org/ui/modules/Landing/Entries'
import Sources from '@databyss-org/ui/modules/Landing/Sources'
import EntriesBySource from '@databyss-org/ui/components/Entry/EntriesBySource'
import EntriesByLocation from '@databyss-org/ui/components/Entry/EntriesByLocation'
import Entry from '@databyss-org/ui/components/Entry/Entry'
import Landing from '@databyss-org/ui/modules/Landing/Landing'
import entriesBySource from '@databyss-org/ui/components/Entry/_entries'
import { ViewportDecorator } from '../decorators'
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
    'Jacques Derrida on HIEROGLYPH / PASIGRAPHY / LEIBNIZ / CHINESE / UNIVERSAL LANGUAGE',
  renderCfItem: cf => (
    <Link key={cf.id} href={`/motif/abyss:${cf.id}`}>
      {cf.lastName}
    </Link>
  ),
}
storiesOf('Modules//Motif Landing', module)
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
      contentTitle="210 entries for “Abyss” in Specters of Marx"
      subtitle="in Specters of Marx"
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
      contentTitle="Databyss includes 210 entries of the motif “ABYSS” from 42 sources by Jacques Derrida"
      subtitle="in Of Grammatology"
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
