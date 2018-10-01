import React from 'react'
import Raw from '../../components/Viewport/Raw'
import TocList from '../../components/List/TocList'
import Link from '../../components/Navigation/Link'
import ContentNav from '../../components/Navigation/ContentNav'
import ContentHeading from '../../components/Heading/ContentHeading'
import ForwardButton from '../../components/Button/ForwardButton'
import styles from './styles.scss'

export default ({ sources, motif, entryCount, authorName }) => (
  <React.Fragment>
    <ContentHeading>
      Databyss includes {entryCount} entries of the motif “{motif.name}” from{' '}
      {sources.length} sources by {authorName}
    </ContentHeading>
    <ContentNav right={<ForwardButton>All Entries</ForwardButton>}>
      <TocList
        ariaLabel={`sources for ${motif.name}`}
        className={styles.sourcesToc}
      >
        {sources.map(source => (
          <Link href={`/motif/${motif.id}/${source.id}`}>
            <Raw
              html={`${source.title}${
                source.entryCount ? ` (${source.entryCount})` : null
              }`}
            />
          </Link>
        ))}
      </TocList>
    </ContentNav>
  </React.Fragment>
)
