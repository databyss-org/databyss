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
import PageNav from '../../components/Navigation/PageNav'
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
      headerSticky: false,
      animateHeader: false,
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
      const distanceFromBottom = this.contentRef.current.getBoundingClientRect()
        .bottom
      const elementHeight =
        this.contentRef.current.offsetHeight + window.innerHeight * 0.02
      const appBarHeight = distanceFromBottom - elementHeight
      this.setState({ appBarCalculatedHeight: appBarHeight })
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
    } = this.state
    if (this.headerRef.current && !headerLoaded) {
      this.setState({ headerLoaded: true })
    }
    if (this.bodyRef.current && !contentLoaded) {
      this.setState({ contentLoaded: true })
    }
    // if both elements are loaded apply logic to set the bottomBorder state
    if (contentLoaded && headerLoaded) {
      const headerBottom = this.headerRef.current.getBoundingClientRect().bottom
      const headerTop = this.headerRef.current.getBoundingClientRect().top
      const headerHeight = headerBottom - headerTop
      const contentHeaderTop = this.bodyRef.current.getBoundingClientRect().top
      const appBarHeight = window.innerHeight * 0.09

      if (
        !headerSticky &&
        contentHeaderTop - appBarHeight < 0 &&
        !animateHeader
      ) {
        this.setState({
          headerSticky: true,
          borderBottom: true,
          animateHeader: true,
        })
        // compensates for the 300ms position animation
        setTimeout(() => this.setState({ animateHeader: false }), 500)
      }
      if (
        headerSticky &&
        contentHeaderTop - headerHeight - appBarCalculatedHeight >= 0 &&
        !animateHeader
      ) {
        this.setState({
          headerSticky: false,
          borderBottom: false,
          animateHeader: true,
        })
        setTimeout(() => this.setState({ animateHeader: false }), 500)
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

    return (
      <Content
        className={classnames(className, classes.landing)}
        _ref={this.contentRef}
      >
        <LandingHeading
          _ref={this.headerRef}
          style={{
            borderBottom: this.state.borderBottom && '1px solid #D6D6D6',
            paddingTop: this.state.headerSticky && '40px',
            position: this.state.headerSticky && 'sticky',
          }}
          left={
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
          }
          right={
            <div className={classes.bottomHeaderContainer}>
              <Dropdown
                list={cfList}
                className={classes.motifLinksSwitch}
                onSelect={value => this.props.onCfListSelect(value.value)}
              />
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
        >
          {cfList && <PageNav ariaLabel="compare with" />}
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
