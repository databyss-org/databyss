import React from 'react'
import SwitchControl from '../../components/Control/SwitchControl'
import Entry from '../../components/Entry/Entry'
import EntryList from '../../components/Entry/EntryList'
import ContentNav from '../../components/Navigation/ContentNav'
import ContentHeading from '../../components/Heading/ContentHeading'
import BackButton from '../../components/Button/BackButton'
import styles from './styles.scss'

export default ({
  showMotifLinks,
  entries,
  onMotifLinksChange,
  authorName,
  motifName,
  entryCount,
  sourceCount,
}) => (
  <React.Fragment>
    <ContentHeading>
      Databyss includes {entryCount} entries of the motif “{motifName}” from{' '}
      {sourceCount} sources by {authorName}
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
        {entries.map((_source, _i) => (
          <EntryList key={_i} ariaLabel={_source.title}>
            {_source.locations.map((_location, __i) => (
              <EntryList key={__i} ariaLabel={_location.raw}>
                {_location.entries.map((entry, ___i) => (
                  <Entry
                    key={___i}
                    {...entry}
                    source={_source}
                    sourceIsRepeat={__i > 0}
                    location={_location.raw}
                    locationIsRepeat={___i > 0}
                  />
                ))}
              </EntryList>
            ))}
          </EntryList>
        ))}
      </EntryList>
    </ContentNav>
  </React.Fragment>
)
