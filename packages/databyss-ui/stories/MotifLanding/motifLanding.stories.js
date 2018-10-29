import React from 'react'
import { storiesOf } from '@storybook/react'
import { ViewportDecorator } from '../decorators'
import Raw from '../../components/Viewport/Raw'
import Link from '../../components/Navigation/Link'
import MotifEntries from '../../modules/MotifLanding/MotifEntries'
import MotifSources from '../../modules/MotifLanding/MotifSources'
import EntriesBySource from '../../components/Entry/EntriesBySource'
import EntriesByLocation from '../../components/Entry/EntriesByLocation'
import Entry from '../../components/Entry/Entry'
import MotifLanding from '../../modules/MotifLanding/MotifLanding'
import entriesBySource from '../../components/Entry/_entries'
import cfAuthors from './_cfauthors'
import sources from './_sources'

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
    <MotifLanding
      {...landingProps}
      contentTitle="Databyss includes 210 entries of the motif “ABYSS” from 42 sources by Jacques Derrida"
    >
      <MotifEntries>
        <EntriesBySource
          sources={entriesBySource}
          renderEntry={entry => <Entry {...entry} />}
        />
      </MotifEntries>
    </MotifLanding>
  ))
  .add('Entries for Source', () => (
    <MotifLanding
      {...landingProps}
      contentTitle={
        <React.Fragment>
          210 entries for “Abyss” in{' '}
          <Link href="/source/SPOM">Specters of Marx</Link>
        </React.Fragment>
      }
    >
      <MotifEntries>
        <EntriesByLocation
          locations={entriesBySource[0].locations}
          renderEntry={entry => <Entry {...entry} />}
        />
      </MotifEntries>
    </MotifLanding>
  ))
  .add('Source TOC', () => (
    <MotifLanding
      {...landingProps}
      contentTitle="Databyss includes 210 entries of the motif “ABYSS” from 44 sources by Jacques Derrida"
    >
      <MotifEntries>
        <MotifSources
          sources={sources}
          renderSource={source => (
            <Link href={`/motif/${landingProps.motif.id}/${source.id}`}>
              <Raw
                html={`${source.title}${
                  source.entryCount ? ` (${source.entryCount})` : null
                }`}
              />
            </Link>
          )}
        />
      </MotifEntries>
    </MotifLanding>
  ))
