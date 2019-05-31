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

class Landing extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      borderBottom: false,
      contentLoaded: false,
      headerLoaded: false,
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll.bind(this), true)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll.bind(this), true)
  }

  handleScroll() {
    // check to see both header and content header are mounted
    const { contentLoaded, headerLoaded, borderBottom } = this.state
    if (document.getElementById('landing-header') && !headerLoaded) {
      this.setState({ headerLoaded: true })
    }
    if (document.getElementById('content-header') && !contentLoaded) {
      this.setState({ contentLoaded: true })
    }

    // if both elements are loaded apply logic to set the bottomBorder state
    if (contentLoaded && headerLoaded) {
      const headerBottom = document
        .getElementById('landing-header')
        .getBoundingClientRect().bottom
      const contentHeaderTop = document
        .getElementById('content-header')
        .getBoundingClientRect().top

      if (headerBottom > contentHeaderTop && !borderBottom) {
        this.setState({ borderBottom: true })
      }

      if (headerBottom < contentHeaderTop && borderBottom) {
        this.setState({ borderBottom: false })
      }
    }
  }

  render() {
    const {
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
    } = this.props

    return (
      <Content className={classnames(className, classes.landing)}>
        <LandingHeading
          id="landing-header"
          style={{
            borderBottom: this.state.borderBottom && '1px solid #D6D6D6',
          }}
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
          <ContentHeading id="content-header">
            <Raw html={contentTitle} />
          </ContentHeading>
          {children}
        </LandingBody>
      </Content>
    )
  }
}

export default injectSheet(styles)(Landing)
