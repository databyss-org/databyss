import { Editor } from 'slate'

export const toSlateJson = hyperscript => {
  const editor = new Editor()
  editor.setValue(hyperscript)
  return editor.value.toJSON()
}

export const matchExpectedJson = expectedJson => $actual => {
  expect(JSON.parse($actual.text())).to.deep.equal(expectedJson)
}

export const matchWithoutId = expectedJson => $actual => {
  const actual = { ...JSON.parse($actual.text()), _id: '' }
  const expected = { ...expectedJson, _id: '' }
  expect(actual).to.deep.equal(expected)
}
