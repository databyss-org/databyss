import { Editor, Value } from 'slate'
import Base64 from 'slate-base64-serializer'

export const toSlateJson = hyperscript => {
  const editor = new Editor()
  editor.setValue(hyperscript)
  return editor.value.toJSON()
}

export const matchExpectedJson = expectedJson => $actual => {
  expect(JSON.parse($actual.text())).to.deep.equal(expectedJson)
}

export const createEncodedFragmentFromValue = value => {
  let _value = JSON.parse(value.text())
  delete _value.data
  delete _value.document
  _value = Value.fromJSON({ document: _value })
  const _editor = new Editor({ value: _value })
  _editor.moveFocusForward(4)
  const _fragment = _editor.value.fragment
  //  var encoded = Base64.serializeNode(_fragment)
  return { value: _value, fragment: _fragment }
}
