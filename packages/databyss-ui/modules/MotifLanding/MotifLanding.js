import React from 'react'
import injectSheet from 'react-jss'
import Content from '../../components/Viewport/Content'
import PageHeading from '../../components/Heading/PageHeading'
import PageSubHeading from '../../components/Heading/PageSubHeading'
import Link from '../../components/Navigation/Link'
import PageNav from '../../components/Navigation/PageNav'
import CommaSeparatedList from '../../components/List/CommaSeparatedList'
import ContentHeading from '../../components/Heading/ContentHeading'
import styles from './styles'

const MotifLanding = ({
  classes,
  source,
  author,
  motif,
  cfAuthors,
  contentTitle,
  children,
}) => {
  const authorName = `${author.firstName} ${author.lastName}`
  const motifName = motif.name
  return (
    <Content className={classes.MotifLanding}>
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
      <ContentHeading>{contentTitle}</ContentHeading>
      {children}
    </Content>
  )
}

export default injectSheet(styles)(MotifLanding)
