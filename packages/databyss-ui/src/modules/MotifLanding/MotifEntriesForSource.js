import React from 'react'
import SwitchControl from '../../components/Control/SwitchControl'
import Entry from '../../components/Entry/Entry'
import EntryList from '../../components/Entry/EntryList'
import PageHeading from '../../components/Heading/PageHeading'
import PageSubHeading from '../../components/Heading/PageSubHeading'
import ContentHeading from '../../components/Heading/ContentHeading'
import Link from '../../components/Navigation/Link'
import PageNav from '../../components/Navigation/PageNav'
import Content from '../../components/Viewport/Content'
import styles from './styles.scss'

export default class MotifEntriesForSource extends React.Component {
  state = {
    showMotifLinks: false,
  }
  render() {
    const entries = this.props[
      this.state.showMotifLinks ? 'linkedEntries' : 'entries'
    ]
    const { authorName, motifName, source, entryCount } = this.props

    return (
      <Content className={styles.motifLanding}>
        <PageHeading>
          {authorName} on “{motifName}”
        </PageHeading>
        {source && (
          <PageSubHeading>
            in <Link href={`/source/${source.id}`}>{source.title}</Link>
          </PageSubHeading>
        )}
        <ContentHeading>
          {entryCount} entries for “{motifName}” in&nbsp;
          <Link href={`/source/${source.id}`}>{source.title}</Link>,
        </ContentHeading>
        <SwitchControl
          label="Motif Links"
          checked={this.state.showLinks}
          onChange={showMotifLinks => this.setState({ showMotifLinks })}
          className={styles.motifLinksSwitch}
        />
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
      </Content>
    )
  }
}
