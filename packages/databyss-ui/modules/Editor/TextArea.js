import React, { Component } from 'react'
import ContentEditable from './ContentEditable'
import { htmlParser } from './_helpers'

export default class TextArea extends Component {
  constructor(props) {
    super(props)
    this.state = {
      index: -1,
      isFocused: false,
      //  htmlState: empty,
    }
    this.handleChange = this.handleChange.bind(this)
    this.textRef = React.createRef()
  }

  componentDidMount() {
    this.props.setRef({
      ref: this.textRef.current,
      index: this.props.blockState.index,
    })
    if (this.props.blockState.index > -1) {
      this.setState({ index: this.props.blockState.index })
    }
  }

  componentDidUpdate(nextProps) {
    if (nextProps.blockState.type === 'NEW_ELEMENT') {
      this.textRef.current.innerHTML = this.textRef.current.innerHTML
      this.textRef.current.focus()
      setTimeout(() => this.props.actions.setFocus(), 10)
    }
  }

  handleChange(text, e) {
    let newHtmlState = { ...this.props.blockState }
    newHtmlState.html = text
    this.parseText(newHtmlState)
  }

  parseText(htmlState) {
    htmlParser({ htmlState, actions: this.props.actions })
  }

  render() {
    return (
      <ContentEditable
        onClick={() =>
          this.props.editRef(this.textRef, this.props.blockState.index)
        }
        htmlState={this.props.blockState}
        onChange={this.handleChange}
        _ref={this.textRef}
      />
    )
  }
}
