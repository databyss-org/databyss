import React, { Component } from 'react'
import ContentEditable from './ContentEditable'
import { htmlParser } from './_helpers'

const empty = {
  html: '',
  rawText: 'enter text',
  source: { name: '' },
}

export default class TextArea extends Component {
  constructor(props) {
    super(props)
    this.state = {
      //  htmlState: empty,
    }
    this.handleChange = this.handleChange.bind(this)
    this.textRef = React.createRef()
  }

  handleChange(text, e) {
    let newHtmlState = { ...this.props.blockState }
    newHtmlState.rawText = text
    newHtmlState.html = text
    this.parseText(newHtmlState)
  }

  parseText(htmlState) {
    const newState = htmlParser(htmlState, this.props.dispatch)
    this.props.dispatch({ type: 'ON_CHANGE', data: newState })
  }

  render() {
    return (
      <div>
        <ContentEditable
          htmlState={this.props.blockState}
          onChange={this.handleChange}
          _ref={this.textRef}
        />
      </div>
    )
  }
}
