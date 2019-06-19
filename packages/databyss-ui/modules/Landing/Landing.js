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
      lastScroll: 0,
      inStickyContainer: false,
      isViewMobile: false,
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

  componentWillReceiveProps() {
    this.handleScroll()
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
      const isWindowMobile = isMobile()
      this.setState({
        appBarCalculatedHeight: appBarHeight,
        lastScroll: scrollTop,
        isViewMobile: isWindowMobile,
      })
    }
  }

  throttleScroll() {
    // throttles the scroll every 30ms
    if (this.time + 20 - Date.now() < 0) {
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
      appBarCalculatedHeight,
      lastScroll,
      inStickyContainer,
      isViewMobile,
    } = this.state

    if (this.headerRef.current && !headerLoaded) {
      this.setState({ headerLoaded: true })
    }
    if (this.bodyRef.current && !contentLoaded) {
      this.setState({ contentLoaded: true })
    }
    // if both elements are loaded apply logic to set the bottomBorder state

    const contentHeaderTop = this.bodyRef.current.getBoundingClientRect().top
    const appBarHeight = window.innerHeight * 0.09
    // calculate if scrolling up or down
    const scrollDown = isViewMobile ? contentHeaderTop <= lastScroll : false

    const w = this.contentRef.current.offsetWidth

    this.setState({ lastScroll: contentHeaderTop, width: w })

    // if mobile use scrollDown variable
    const mobileHeaderisSticky = isViewMobile
      ? !headerSticky && contentHeaderTop - appBarHeight < 0 && !scrollDown
      : !headerSticky && contentHeaderTop - appBarHeight < 0

    if (contentLoaded && headerLoaded) {
      if (mobileHeaderisSticky) {
        this.setState({ inStickyContainer: true })
        this.setState({
          headerSticky: true,
        })
      }

      if (isViewMobile && inStickyContainer && scrollDown && headerSticky) {
        this.setState({
          headerSticky: false,
        })
      }

      if (headerSticky && contentHeaderTop - appBarCalculatedHeight >= 0) {
        this.setState({
          headerSticky: false,
          inStickyContainer: false,
        })
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

    const { headerSticky, inStickyContainer, isViewMobile, width } = this.state

    const rightHeader = (
      <div className={classes.bottomHeaderContainer}>
        {isViewMobile ? (
          <CfMobileModal
            parentRef={this.contentRef.current}
            list={cfList}
            onSelect={value => this.props.onCfListSelect(value)}
            modalTitle={title}
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
    )

    const leftHeader = isStickyMount =>
      isStickyMount ? (
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
      ) : (
        <div>
          <PageHeading>
            <Raw html={title} />
          </PageHeading>
          {subtitle && (
            <PageSubHeading>
              <Raw html={subtitle} />
            </PageSubHeading>
          )}
        </div>
      )

    const stickyHeader = (
      <div
        style={{
          top: window.innerHeight * 0.09,
        }}
        className={classnames(
          headerSticky ? classes.stickyContainer : classes.notSticky
        )}
      >
        <div
          style={{ width: !isViewMobile && width }}
          className={classes.stickyContent}
        >
          <LandingHeading
            className={classes.bottomBorder}
            left={leftHeader(true)}
            right={rightHeader}
          />
        </div>
      </div>
    )

    return (
      <Content
        className={classnames(className, classes.landing)}
        _ref={this.contentRef}
      >
        {stickyHeader}
        <LandingHeading
          _ref={this.headerRef}
          left={leftHeader(false)}
          right={rightHeader}
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
