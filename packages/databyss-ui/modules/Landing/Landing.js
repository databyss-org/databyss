import React from 'react'
import injectSheet from 'react-jss'
import classnames from 'classnames'
import SwitchControl from '../../components/Control/SwitchControl'
import Content from '../../components/Viewport/Content'
import LandingBody from '../../components/Viewport/LandingBody'
import Raw from '../../components/Viewport/Raw'
import PageHeading from '../../components/Heading/PageHeading'
import PageSubHeading from '../../components/Heading/PageSubHeading'
import PageNav from '../../components/Navigation/PageNav'
import CommaSeparatedList from '../../components/List/CommaSeparatedList'
import LandingHeading from '../../components/Heading/LandingHeading'
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
  showMotifLinks,
  onMotifLinksChange,
  withToggle,
}) => (
  <Content className={classnames(className, classes.landing)}>
    <LandingHeading
      left={
        <PageHeading>
          <Raw html={title} />
        </PageHeading>
      }
      right={
        withToggle ? (
          <SwitchControl
            label="Motif Links"
            checked={showMotifLinks}
            onChange={onMotifLinksChange}
            className={classes.motifLinksSwitch}
          />
        ) : null
      }
    >
      {subtitle && (
        <PageSubHeading>
          <Raw html={subtitle} />
        </PageSubHeading>
      )}

      {cfList && (
        <PageNav ariaLabel="compare with">
          <CommaSeparatedList opener="[cf.&nbsp;" closer="]">
            {cfList.map(cf =>
              React.cloneElement(renderCfItem(cf), { key: cf.id })
            )}
          </CommaSeparatedList>
        </PageNav>
      )}
    </LandingHeading>
    <LandingBody>
      <ContentHeading>
        <Raw html={contentTitle} />
      </ContentHeading>
      {children}
    </LandingBody>
  </Content>
)

export default injectSheet(styles)(Landing)
