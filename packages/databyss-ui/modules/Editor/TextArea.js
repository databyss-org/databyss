import React, { Component } from 'react'
import { withEditorContext } from './EditorProvider'
import ContentEditable from './ContentEditable'
import { htmlParser } from './_helpers'
import { setRef, setFocus, setEditRef, onEdit } from './actions/actions'

class TextArea extends Component {
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
    const [, dispatch] = this.props.editorContext
    const { blockState } = this.props
    dispatch(
      setRef({
        ref: this.textRef.current,
        index: blockState.index,
      })
    )
    if (blockState.index > -1) {
      this.setState({ index: blockState.index })
    }
  }

  componentDidUpdate(nextProps) {
    const [, dispatch] = this.props.editorContext
    if (nextProps.blockState.type === 'NEW_ELEMENT') {
      this.textRef.current.innerHTML = this.textRef.current.innerHTML
      this.textRef.current.focus()
      setTimeout(() => dispatch(setFocus()), 10)
    }
  }

  handleChange(text) {
    const newHtmlState = { ...this.props.blockState }
    newHtmlState.html = text
    this.parseText(newHtmlState)
  }

  parseText(htmlState) {
    const [, dispatch] = this.props.editorContext
    const data = htmlParser(htmlState)
    if (htmlState.index > -1) {
      dispatch(onEdit(data))
    }
  }

  render() {
    const [, dispatch] = this.props.editorContext
    const { blockState } = this.props
    return (
      <ContentEditable
        onClick={() => dispatch(setEditRef(this.textRef, blockState.index))}
        htmlState={blockState}
        onChange={this.handleChange}
        _ref={this.textRef}
      />
    )
  }
}

export default withEditorContext(TextArea)
