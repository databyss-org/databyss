/** @jsx h */
/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession } from '@databyss-org/ui/lib/saucelabs'
import { sanitizeEditorChildren } from './util'
import {
  getEditor,
  sleep,
  getElementById,
  jsx as h,
  login,
  tryQuit,
} from './util.selenium'

let driver
let editor
let slateDocument

describe('editor selenium', () => {
  beforeEach(async (done) => {
    driver = await startSession()
    await login(driver)
    editor = await getEditor(driver)
    await editor.sendKeys(Key.ARROW_DOWN)
    done()
  })

  afterEach(async (done) => {
    await tryQuit(driver)
    done()
  })

  it('should test basic editor functionality', async () => {
    await editor.sendKeys('this is an example of an entry text')
    // allow a single return within an entry
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys('this should be on the same block')
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys('@this is an example of a source text')
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys('#this is an example of a topic text')
    await editor.sendKeys(Key.ENTER)
    await sleep(300)

    slateDocument = await getElementById(driver, 'slateDocument')

    let actual = JSON.parse(await slateDocument.getText())

    let expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be on the same
          block
        </block>
        <block type="SOURCE">this is an example of a source text</block>
        <block type="TOPIC">this is an example of a topic text</block>
        <block type="ENTRY">
          <cursor />
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    // should not allow content change on atomic blocks
    await editor.sendKeys(Key.ARROW_UP)
    await sleep(300)
    await editor.sendKeys('this text should not be allowed')
    await sleep(300)

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())

    expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be on the same
          block
        </block>
        <block type="SOURCE">this is an example of a source text</block>
        <block type="TOPIC">
          <cursor />
          this is an example of a topic text
        </block>
        <block type="ENTRY">
          <text />
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    // should allow backspace on an entry
    await editor.sendKeys(Key.ARROW_UP)
    await sleep(300)
    await editor.sendKeys(Key.ARROW_LEFT)
    await sleep(300)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)

    await sleep(300)

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())

    expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be on the same
          <cursor />
        </block>
        <block type="SOURCE">this is an example of a source text</block>
        <block type="TOPIC">this is an example of a topic text</block>
        <block type="ENTRY">
          <text />
        </block>
      </editor>
    )
    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    // should remove the atomic block on backspace and allow an entry
    await editor.sendKeys(Key.ARROW_RIGHT)
    await sleep(300)
    await editor.sendKeys(Key.ARROW_DOWN)
    await sleep(300)
    await editor.sendKeys(Key.ARROW_DOWN)
    await sleep(300)
    await editor.sendKeys(Key.ARROW_LEFT)
    await sleep(300)
    await editor.sendKeys(Key.BACK_SPACE)
    await sleep(300)
    await editor.sendKeys('this entry replaces a topic')

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())

    expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be on the same
        </block>
        <block type="SOURCE">this is an example of a source text</block>
        <block type="ENTRY">
          this entry replaces a topic
          <cursor />
        </block>
        <block type="ENTRY">
          <text />
        </block>
      </editor>
    )
    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
    // should merge two entry blocks on backspace
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys(' move')
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.BACK_SPACE)
    await sleep(3000)

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())

    expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be on the same
        </block>
        <block type="SOURCE">this is an example of a source text</block>
        <block type="ENTRY">
          this entry replaces a topic
          <cursor /> move
        </block>
        <block type="ENTRY">
          <text />
        </block>
      </editor>
    )
    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should test inline editor functionality', async () => {
    await sleep(300)
    await editor.sendKeys('this is an example of an entry text')
    // allow a single return within an entry
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys('this should #')
    // should toggle inline mark

    slateDocument = await getElementById(driver, 'slateDocument')

    let actual = JSON.parse(await slateDocument.getText())
    let expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should{' '}
          <text inlineAtomicMenu>
            #<cursor />
          </text>
        </block>
      </editor>
    )

    await editor.sendKeys(Key.ENTER)

    slateDocument = await getElementById(driver, 'slateDocument')

    // should clear inline mark when only hash appears
    actual = JSON.parse(await slateDocument.getText())
    expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should #<cursor />
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)

    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys('#')

    slateDocument = await getElementById(driver, 'slateDocument')

    // should slurp next word
    actual = JSON.parse(await slateDocument.getText())
    expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this{' '}
          <text inlineAtomicMenu>
            #should
            <cursor />
          </text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys('should be in the middle')
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys('#')

    slateDocument = await getElementById(driver, 'slateDocument')

    // should work in the middle of a word
    actual = JSON.parse(await slateDocument.getText())
    expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be in the mid
          <text inlineAtomicMenu>
            #dle
            <cursor />
          </text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    // should test escape removing inline
    await editor.sendKeys(Key.ESCAPE)

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())
    expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be in the mid#dle
          <cursor />
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    // space bar should also escape inline range
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys('#')
    await editor.sendKeys(Key.SPACE)
    await editor.sendKeys('plaintext')

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())
    expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be in the #
          plaintext
          <cursor />
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    // should remove the # on an active inline range and remove ranges
    await editor.sendKeys(' append #this')
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.BACK_SPACE)

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())
    expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be in the #
          plaintext append <cursor />
          this
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    // right arrow on empty hashtag should remove mark
    await editor.sendKeys(' ')
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys('#')
    await editor.sendKeys(Key.ARROW_RIGHT)

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())
    expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be in the #
          plaintext append #<cursor /> this
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    // should bake atomic with correct id

    await editor.sendKeys(Key.ARROW_DOWN)
    await editor.sendKeys(Key.ARROW_DOWN)
    await sleep(1000)
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys('add #some topic')
    await sleep(1000)
    await editor.sendKeys(Key.ENTER)
    await sleep(500)

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())
    expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be in the #
          plaintext append # this
        </block>
        <block type="ENTRY">
          add{' '}
          <text inlineTopic atomicId="5e3b1bc48fb28680fe26437d">
            #some topic
            <cursor />
          </text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    // if only an inline is left on block, editor should not turn it into an atomic block
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await sleep(500)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(' add text')

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())
    expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be in the #
          plaintext append # this add text
          <cursor />
        </block>
        <block type="ENTRY">
          <text />
          <text inlineTopic atomicId="5e3b1bc48fb28680fe26437d">
            #some topic
          </text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    // should test the ability to navigate around the inline topic
    await editor.sendKeys(Key.ARROW_RIGHT)
    await editor.sendKeys('add this text ')
    await editor.sendKeys(Key.ARROW_DOWN)
    await sleep(500)
    await editor.sendKeys('text')
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ENTER)
    await sleep(500)

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())
    expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be in the #
          plaintext append # this add text
        </block>
        <block type="ENTRY">
          add this text{' '}
          <text inlineTopic atomicId="5e3b1bc48fb28680fe26437d">
            #some topic
          </text>
          {'\n'}
          <cursor />
          text
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    // backspace should remove inline
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())
    expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be in the #
          plaintext append # this add text
        </block>
        <block type="ENTRY">
          add this text <cursor />
          text
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })
})
