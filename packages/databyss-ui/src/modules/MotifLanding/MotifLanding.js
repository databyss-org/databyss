import React from 'react'
import Content from '../../components/Viewport/Content'
import PageHeading from '../../components/Heading/PageHeading'
import PageSubHeading from '../../components/Heading/PageSubHeading'
import Link from '../../components/Navigation/Link'
import MotifEntries from './MotifEntries'
import MotifEntriesForSource from './MotifEntriesForSource'
import MotifSources from './MotifSources'
import PageNav from '../../components/Navigation/PageNav'
import CommaSeparatedList from '../../components/List/CommaSeparatedList'
import styles from './styles.scss'

const EntriesOrSources = ({ showAllEntries, source, ...others }) => {
  if (source) {
    return <MotifEntriesForSource source={source} {...others} />
  }
  if (showAllEntries) {
    return <MotifEntries {...others} />
  }
  return <MotifSources sources={others.sources} {...others} />
}

export default ({ source, author, motif, cfAuthors, ...others }) => {
  const authorName = `${author.firstName} ${author.lastName}`
  const motifName = motif.name
  const entriesProps = { authorName, motifName, motif }
  return (
    <Content className={styles.MotifLanding}>
      <PageHeading>
        {authorName} on “{motifName}”
      </PageHeading>
      {source && (
        <PageSubHeading>
          in <Link href={`/source/${source.id}`}>{source.title}</Link>
        </PageSubHeading>
      )}
      {cfAuthors && (
        <PageNav ariaLabel="other authors">
          [cf.{'\u00A0'}
          <CommaSeparatedList>
            {cfAuthors.map(cf => (
              <Link key={cf.id} href={`/motif/${motif.id}:${cf.id}`}>
                {cf.lastName}
              </Link>
            ))}
          </CommaSeparatedList>
          ]
        </PageNav>
      )}
      <EntriesOrSources source={source} {...others} {...entriesProps} />
    </Content>
  )
}
