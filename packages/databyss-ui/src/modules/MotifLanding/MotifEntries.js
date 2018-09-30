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

export default class MotifEntries extends React.Component {
  state = {
    showMotifLinks: false,
  }
  render() {
    const entries = this.props[
      this.state.showMotifLinks ? 'linkedEntries' : 'entries'
    ]
    const {
      authorName,
      motifName,
      source,
      entryCount,
      sourceCount,
    } = this.props

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
          Databyss includes {entryCount} entries of the motif “{motifName}” from{' '}
          {sourceCount} sources by {authorName}
        </ContentHeading>
        <SwitchControl
          label="Motif Links"
          checked={this.state.showLinks}
          onChange={showMotifLinks => this.setState({ showMotifLinks })}
          className={styles.motifLinksSwitch}
        />
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
      </Content>
    )
  }
}
