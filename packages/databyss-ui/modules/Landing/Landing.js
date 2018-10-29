import React from 'react'
import injectSheet from 'react-jss'
import Content from '../../components/Viewport/Content'
import PageHeading from '../../components/Heading/PageHeading'
import PageSubHeading from '../../components/Heading/PageSubHeading'
import PageNav from '../../components/Navigation/PageNav'
import CommaSeparatedList from '../../components/List/CommaSeparatedList'
import ContentHeading from '../../components/Heading/ContentHeading'
import styles from './styles'

const Landing = ({
  classes,
  cfList,
  renderCfItem,
  contentTitle,
  children,
  title,
  subtitle,
}) => (
  <Content className={classes.landing}>
    <PageHeading>{title}</PageHeading>
    {subtitle && <PageSubHeading>{subtitle}</PageSubHeading>}
    {cfList && (
      <PageNav ariaLabel="compare with">
        [cf.{'\u00A0'}
        <CommaSeparatedList>
          {cfList.map(cf => renderCfItem(cf))}
        </CommaSeparatedList>
        ]
      </PageNav>
    )}
    <ContentHeading>{contentTitle}</ContentHeading>
    {children}
  </Content>
)

export default injectSheet(styles)(Landing)
