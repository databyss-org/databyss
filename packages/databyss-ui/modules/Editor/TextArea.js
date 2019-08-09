import React, { Component } from 'react'
import ContentEditable from './ContentEditable'
import { htmlParser, styleSelector } from './_helpers'
import { Text } from '@databyss-org/ui/primitives'

export default class TextArea extends Component {
  constructor(props) {
    super(props)
    this.state = {
      //  htmlState: empty,
    }
    this.handleChange = this.handleChange.bind(this)
    this.textRef = React.createRef()
  }

  componentDidMount() {
    this.props.setRef(this.textRef)
  }

  componentDidUpdate(nextProps) {
    // if element isnt active elemnt, set focus
    if (nextProps.blockState.type === 'NEW_ELEMENT') {
      this.textRef.current.innerHTML = this.textRef.current.innerHTML
      this.textRef.current.focus()
      setTimeout(() => this.props.dispatch({ type: 'SET_FOCUS' }), 10)
    }
  }

  handleChange(text, e) {
    let newHtmlState = { ...this.props.blockState }
    //  newHtmlState.rawText = text
    newHtmlState.html = text
    this.parseText(newHtmlState)
  }

  parseText(htmlState) {
    htmlParser(htmlState, this.props.dispatch)
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
