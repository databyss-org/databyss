import React from 'react'
import injectSheet from 'react-jss'
import classnames from 'classnames'
import SwitchControl from '../../components/Control/SwitchControl'
import Dropdown from '../../components/Control/Dropdown'
import Content from '../../components/Viewport/Content'
import LandingBody from '../../components/Viewport/LandingBody'
import Raw from '../../components/Viewport/Raw'
import PageHeading from '../../components/Heading/PageHeading'
import PageSubHeading from '../../components/Heading/PageSubHeading'
import LandingHeading from '../../components/Heading/LandingHeading'
import ContentHeading from '../../components/Heading/ContentHeading'
import CfMobileModal from '../../components/Modal/CfMobileModal'
import { isMobile } from '../../lib/mediaQuery'
import styles from './styles'

class Landing extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      contentLoaded: false,
      appBarCalculatedHeight: 0,
      headerLoaded: false,
      headerSticky: false,
      animateHeader: false,
      lastScroll: 0,
      inStickyContainer: false,
    }
    this.headerRef = React.createRef()
    this.bodyRef = React.createRef()
    this.contentRef = React.createRef()
    this.throttleScroll = this.throttleScroll.bind(this)
    this.time = Date.now()
  }

  componentDidMount() {
    this.calculateToolbarHeight()

    if (this.contentRef.current) {
      window.addEventListener('scroll', this.throttleScroll, true)
    }
  }

  componentWillUnmount() {
    if (this.contentRef.current) {
      window.removeEventListener('scroll', this.throttleScroll, true)
    }
  }

  calculateToolbarHeight() {
    if (this.contentRef.current) {
      const content = this.contentRef.current

      const distanceFromBottom = content.getBoundingClientRect().bottom
      const elementHeight = content.offsetHeight + window.innerHeight * 0.02
      const appBarHeight = distanceFromBottom - elementHeight
      const scrollTop = this.bodyRef.current.getBoundingClientRect().top
      this.setState({
        appBarCalculatedHeight: appBarHeight,
        lastScroll: scrollTop,
      })
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
    const {
      contentLoaded,
      headerLoaded,
      headerSticky,
      animateHeader,
      appBarCalculatedHeight,
      lastScroll,
      inStickyContainer,
    } = this.state
    if (this.headerRef.current && !headerLoaded) {
      this.setState({ headerLoaded: true })
    }
    if (this.bodyRef.current && !contentLoaded) {
      this.setState({ contentLoaded: true })
    }
    // if both elements are loaded apply logic to set the bottomBorder state
    if (contentLoaded && headerLoaded && !animateHeader) {
      const headerBottom = this.headerRef.current.getBoundingClientRect().bottom
      const headerTop = this.headerRef.current.getBoundingClientRect().top
      const headerHeight = headerBottom - headerTop
      const contentHeaderTop = this.bodyRef.current.getBoundingClientRect().top
      const appBarHeight = window.innerHeight * 0.09

      // calculate if scrolling up or down
      const scrollDown = contentHeaderTop < lastScroll
      this.setState({ lastScroll: contentHeaderTop })

      if (!headerSticky && contentHeaderTop - appBarHeight < 0 && !scrollDown) {
        this.setState({ inStickyContainer: true })
        this.setState({
          headerSticky: true,
          animateHeader: true,
        })
        // compensates for the 300ms position animation
        setTimeout(() => this.setState({ animateHeader: false }), 700)
      }
      if (inStickyContainer && scrollDown && headerSticky) {
        this.setState({
          headerSticky: false,
          animateHeader: true,
        })
        setTimeout(() => this.setState({ animateHeader: false }), 700)
      }
      if (
        headerSticky &&
        contentHeaderTop - headerHeight - appBarCalculatedHeight >= 0
      ) {
        this.setState({
          headerSticky: false,
          animateHeader: true,
          inStickyContainer: false,
        })
        setTimeout(() => this.setState({ animateHeader: false }), 700)
      }
    }
  }

  render() {
    const {
      className,
      classes,
      cfList,
      contentTitle,
      children,
      title,
      subtitle,
      showMotifLinks,
      onMotifLinksChange,
      withToggle,
    } = this.props
    const {
      headerSticky,
      inStickyContainer,
      appBarCalculatedHeight,
    } = this.state
    const mobile = isMobile()
    return (
      <Content
        className={classnames(className, classes.landing)}
        _ref={this.contentRef}
      >
        <LandingHeading
          _ref={this.headerRef}
          className={classnames(
            headerSticky
              ? classes.sticky
              : inStickyContainer && classes.notSticky
          )}
          left={
            <div>
              <PageHeading
                headerSticky={headerSticky}
                inStickyContainer={inStickyContainer}
              >
                <Raw html={title} />
              </PageHeading>
              {subtitle && (
                <PageSubHeading
                  headerSticky={headerSticky}
                  inStickyContainer={inStickyContainer}
                >
                  <Raw html={subtitle} />
                </PageSubHeading>
              )}
            </div>
          }
          right={
            <div className={classes.bottomHeaderContainer}>
              {mobile ? (
                <CfMobileModal
                  parentRef={this.contentRef.current}
                  appBarCalculatedHeight={appBarCalculatedHeight}
                  list={cfList}
                  onSelect={value => this.props.onCfListSelect(value)}
                />
              ) : (
                <Dropdown
                  list={cfList}
                  className={classes.motifLinksSwitch}
                  onSelect={value => this.props.onCfListSelect(value.value)}
                />
              )}
              {withToggle ? (
                <SwitchControl
                  label="Motif Links"
                  checked={showMotifLinks}
                  onChange={onMotifLinksChange}
                  className={classes.motifLinksSwitch}
                />
              ) : null}
            </div>
          }
        />

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
