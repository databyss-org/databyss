import { Editor } from 'slate'

export const toSlateJson = hyperscript => {
  const editor = new Editor()
  editor.setValue(hyperscript)
  return editor.value.toJSON()
}

export const matchExpectedJson = expectedJson => $actual => {
  expect(JSON.parse($actual.text())).to.deep.equal(expectedJson)
}
