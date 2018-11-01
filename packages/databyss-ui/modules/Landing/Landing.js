import React from 'react'
import injectSheet from 'react-jss'
import classnames from 'classnames'
import Content from '../../components/Viewport/Content'
import PageHeading from '../../components/Heading/PageHeading'
import PageSubHeading from '../../components/Heading/PageSubHeading'
import PageNav from '../../components/Navigation/PageNav'
import CommaSeparatedList from '../../components/List/CommaSeparatedList'
import ContentHeading from '../../components/Heading/ContentHeading'
import styles from './styles'

const Landing = ({
  className,
  classes,
  cfList,
  renderCfItem,
  contentTitle,
  children,
  title,
  subtitle,
}) => (
  <Content className={classnames(className, classes.landing)}>
    <PageHeading>{title}</PageHeading>
    {subtitle && <PageSubHeading>{subtitle}</PageSubHeading>}
    {cfList && (
      <PageNav ariaLabel="compare with">
        [cf.{'\u00A0'}
        <CommaSeparatedList>
          {cfList.map(cf =>
            React.cloneElement(renderCfItem(cf), { key: cf.id })
          )}
        </CommaSeparatedList>
        ]
      </PageNav>
    )}
    <ContentHeading>{contentTitle}</ContentHeading>
    {children}
  </Content>
)

export default injectSheet(styles)(Landing)
