import React from 'react'
import SwitchControl from '../../components/Control/SwitchControl'
import Entry from '../../components/Entry/Entry'
import EntryList from '../../components/Entry/EntryList'
import ContentNav from '../../components/Navigation/ContentNav'
import ContentHeading from '../../components/Heading/ContentHeading'
import BackButton from '../../components/Button/BackButton'
import Link from '../../components/Navigation/Link'
import styles from './styles.scss'

export default ({
  motifName,
  source,
  entryCount,
  entries,
  showMotifLinks,
  onMotifLinksChange,
}) => (
  <React.Fragment>
    <ContentHeading>
      {entryCount} entries for “{motifName}” in&nbsp;
      <Link href={`/source/${source.id}`}>{source.title}</Link>,
    </ContentHeading>
    <ContentNav
      left={<BackButton>Sources</BackButton>}
      right={
        <SwitchControl
          label="Motif Links"
          checked={showMotifLinks}
          onChange={onMotifLinksChange}
          className={styles.motifLinksSwitch}
        />
      }
    >
      <EntryList>
        {entries.map((_location, _i) => (
          <EntryList key={_i} ariaLabel={_location.raw}>
            {_location.entries.map((entry, __i) => (
              <Entry
                key={__i}
                {...entry}
                location={_location.raw}
                locationIsRepeat={__i > 0}
              />
            ))}
          </EntryList>
        ))}
      </EntryList>
    </ContentNav>
  </React.Fragment>
)
