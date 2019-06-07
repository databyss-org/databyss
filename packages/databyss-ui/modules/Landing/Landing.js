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
    this.headerRef = React.createRef()
    this.bodyRef = React.createRef()
    this.contentRef = React.createRef()
    // this.handleScroll = this.handleScroll.bind(this)
    this.throttleScroll = this.throttleScroll.bind(this)
    this.time = Date.now()
  }

  componentDidMount() {
    if (this.contentRef.current) {
      this.contentRef.current.addEventListener(
        'scroll',
        this.throttleScroll,
        true
      )
    }
  }

  componentWillUnmount() {
    if (this.contentRef.current) {
      this.contentRef.current.removeEventListener(
        'scroll',
        this.throttleScroll,
        true
      )
    }
  }

  throttleScroll() {
    // throttles the scroll every 30ms
    if (this.time + 30 - Date.now() < 0) {
      this.time = Date.now()
      this.handleScroll()
    }
  }

  handleScroll() {
    // check to see both header and content header are mounted
    const { contentLoaded, headerLoaded, borderBottom } = this.state

    if (this.headerRef.current && !headerLoaded) {
      this.setState({ headerLoaded: true })
    }
    if (this.bodyRef.current && !contentLoaded) {
      this.setState({ contentLoaded: true })
    }

    // if both elements are loaded apply logic to set the bottomBorder state
    if (contentLoaded && headerLoaded) {
      const headerBottom = this.headerRef.current.getBoundingClientRect().bottom
      const contentHeaderTop = this.bodyRef.current.getBoundingClientRect().top

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
      <Content
        className={classnames(className, classes.landing)}
        _ref={this.contentRef}
      >
        <LandingHeading
          _ref={this.headerRef}
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
          <ContentHeading _ref={this.bodyRef}>
            <Raw html={contentTitle} />
          </ContentHeading>
          {children}
        </LandingBody>
      </Content>
    )
  }
}

export default injectSheet(styles)(Landing)
