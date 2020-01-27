/** @jsx h */

/* eslint-disable func-names */

import h from 'slate-hyperscript'
import { toSlateJson, matchExpectedJson } from './_helpers'
// import {  } from './../hotKeys'

context('Editor', () => {
  beforeEach(() => {
    cy.visit('http://localhost:6006/iframe.html?id=cypress-tests--slate-empty')
    cy.get('[contenteditable="true"]')
      .as('editor')
      .focus()
    cy.get('#slateDocument').as('slateDocument')
    cy.get('#pageBlocks').as('pageBlocks')
  })

  it('renders the contenteditable container', () => {
    cy.get('@editor').should('have.attr', 'role')
  })

  it('should set initial blocks', () => {
    cy.get('@editor').click()
    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="ENTRY" data={{ refId: refIdList[0], type='ENTRY' }}>
              <text />
            </block>
          </document>
        </value>
      )

      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })
  // issue #116
  it('should not allow location on atomic block', () => {
    cy.get('@editor')
      .type('@source and ')
      .toggleLocation()
      .type('not location')
      .newLine()
      .previousBlock()

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="SOURCE" data={{ refId: refIdList[0], type: 'SOURCE' }}>
              <text />
              <inline type="SOURCE">source and not location</inline>
              <text />
            </block>
            <block type="ENTRY" data={{ refId: refIdList[1], type: 'ENTRY' }} />
          </document>
        </value>
      )

      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })

  // issue #117
  it('should remove formatted # or @', () => {
    cy.get('@editor')
      .toggleBold()
      .type('@source')
      .newLine()
      .previousBlock()

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="SOURCE" data={{ refId: refIdList[0], type: 'SOURCE' }}>
              <text />
              <inline type="SOURCE">
                <mark type="bold">{'<strong>source</strong>'}</mark>
              </inline>
              <text />
            </block>
            <block type="ENTRY" data={{ refId: refIdList[1], type: 'ENTRY' }} />
          </document>
        </value>
      )

      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })
  // https://www.notion.so/databyss/Tab-in-editor-moves-focus-away-9dedc0df7fb6417b86fa0cc5c2f7cb03
  it('should trim white space on atomic blocks and allow tabs on entries', () => {
    cy.get('@editor')
      .type('    @source name')
      .newLine()
      .type('\t@second source')
      .newLine()
      .wait(500)
    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="SOURCE" data={{ refId: refIdList[0], type: 'SOURCE' }}>
              <text />
              <inline type="SOURCE">source name</inline>
              <text />
            </block>
            <block type="SOURCE" data={{ refId: refIdList[1], type: 'SOURCE' }}>
              <text />
              <inline type="SOURCE">second source</inline>
              <text />
            </block>
            <block type="ENTRY" data={{ refId: refIdList[2], type: 'ENTRY' }} />
          </document>
        </value>
      )
      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })

  // https://www.notion.so/databyss/Format-menu-keystrokes-shouldn-t-show-work-on-atomic-blocks-8190f837c9014d108fda7ca948a5bdf8
  it('should highlight atomic block and not allow format menu', () => {
    cy.get('@editor')
      .type('@Source Name')
      .newLine()
      .previousBlock()
      .setSelection('Source Name')
      .get('[data-test-format-menu="italic"]')
      .click({ force: true })

    cy.once('fail', err => {
      // Capturing the fail event swallows it and lets the test succeed

      // Now look for the expected messages
      expect(err.message).to.include('cy.click() failed because this element')
      expect(err.message).to.include('is being covered by another element')
    })
  })

  // https://www.notion.so/databyss/Demo-error-3-If-you-press-and-then-return-i-e-without-typing-anything-it-goes-to-the-next-lin-aba055d79d334040a9798a55d0f18356
  it('it should delete an atomic block when only the start symbol is entered', () => {
    cy.get('@editor')
      .type('@')
      .newLine()
      .type('#')
      .newLine()
      .type('@this is a source')
      .newLine()
      .wait(500)

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="ENTRY" data={{ refId: refIdList[0], type: 'ENTRY' }} />
            <block type="ENTRY" data={{ refId: refIdList[1], type: 'ENTRY' }} />
            <block type="SOURCE" data={{ refId: refIdList[2], type: 'SOURCE' }}>
              <text />
              <inline type="SOURCE">this is a source</inline>
              <text />
            </block>
            <block type="ENTRY" data={{ refId: refIdList[3], type: 'ENTRY' }} />
          </document>
        </value>
      )

      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })
})

context('Editor', () => {
  beforeEach(() => {
    cy.visit('http://localhost:6006/iframe.html?id=cypress-tests--slate')
    cy.get('[contenteditable="true"]')
      .as('editor')
      .focus()
    cy.get('#pageBlocks').as('pageBlocks')
    cy.get('#slateDocument').as('slateDocument')
  })

  it('renders the contenteditable container', () => {
    cy.get('@editor').should('have.attr', 'role')
  })

  // https://www.notion.so/databyss/Editor-crashes-on-backspace-edge-case-f3fd18b2ba6e4df190703a94815542ed
  it('should highlight empty block and remove the block', () => {
    cy.get('@editor')
      .endOfDoc()
      .previousBlock()
      .endOfLine()
      .newLine()
      .type('{shift}{rightarrow}')
      .type('{backspace}')

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="SOURCE" data={{ refId: refIdList[0], type: 'SOURCE' }}>
              <text />
              <inline type="SOURCE">
                Stamenov, Language Structure, Discourse and the Access to
                Consciousness
              </inline>
              <text />
            </block>
            <block type="ENTRY" data={{ refId: refIdList[1], type: 'ENTRY' }}>
              On the limitation of third-order thought to assertion
            </block>
            <block type="TOPIC" data={{ refId: refIdList[2], type: 'TOPIC' }}>
              <text />
              <inline type="TOPIC">topic</inline>
              <text />
            </block>
          </document>
        </value>
      )
      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })

  it('should delete prevoius block if atomic and backspace clicked', () => {
    cy.get('@editor')
      .nextBlock()
      .startOfLine()
      .type('{backspace}')

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="ENTRY" data={{ refId: refIdList[0], type: 'ENTRY' }}>
              On the limitation of third-order thought to assertion
            </block>
            <block type="TOPIC" data={{ refId: refIdList[1], type: 'TOPIC' }}>
              <text />
              <inline type="TOPIC">topic</inline>
              <text />
            </block>
          </document>
        </value>
      )
      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })

  // Case 1
  // https://www.notion.so/databyss/Delete-doesn-t-always-work-when-text-is-selected-932220d69dc84bbbb133265d8575a123
  it('should highlight atomic block and delete it', () => {
    cy.get('@editor')
      .startOfDoc()
      .setSelection(
        'Stamenov, Language Structure, Discourse and the Access to Consciousness'
      )
      .type('{backspace}')

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="ENTRY" data={{ refId: refIdList[0], type: 'ENTRY' }} />
            <block type="ENTRY" data={{ refId: refIdList[1], type: 'ENTRY' }}>
              On the limitation of third-order thought to assertion
            </block>
            <block type="TOPIC" data={{ refId: refIdList[2], type: 'TOPIC' }}>
              <text />
              <inline type="TOPIC">topic</inline>
              <text />
            </block>
          </document>
        </value>
      )
      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })
  // case 2
  // https://www.notion.so/databyss/Delete-doesn-t-always-work-when-text-is-selected-932220d69dc84bbbb133265d8575a123
  it('should highlight all content and delete', () => {
    cy.get('@editor')
      .endOfDoc()
      .type('{selectall}')
      .type('{backspace}')
    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="ENTRY" data={{ refId: refIdList[0], type: 'ENTRY' }}>
              <text />
            </block>
          </document>
        </value>
      )

      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })
  // https://www.notion.so/databyss/Delete-doesn-t-always-work-when-text-is-selected-932220d69dc84bbbb133265d8575a123
  it('case 3 highlight text', () => {
    cy.get('@editor')
      .endOfDoc()
      .type('{selectall}')
      .type('{backspace}')
      .type('{backspace}')
      .type('{rightarrow}')
      .type('this is some text')
      .setSelection('some ')
      .type('{backspace}')
      .wait(500)

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="ENTRY" data={{ refId: refIdList[0], type: 'ENTRY' }}>
              this is text
            </block>
          </document>
        </value>
      )

      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })

  // https://www.notion.so/databyss/Delete-doesn-t-always-work-when-text-is-selected-932220d69dc84bbbb133265d8575a123
  it('case 4', () => {
    cy.get('@editor')
      .setSelection('On the limitation of third-order thought to assertion')
      .type('{backspace}')
      .wait(500)

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="SOURCE" data={{ refId: refIdList[0], type: 'SOURCE' }}>
              <text />
              <inline type="SOURCE">
                Stamenov, Language Structure, Discourse and the Access to
                Consciousness
              </inline>
              <text />
            </block>
            <block type="ENTRY" data={{ refId: refIdList[1], type: 'ENTRY' }}>
              <text />
            </block>
            <block type="TOPIC" data={{ refId: refIdList[2], type: 'TOPIC' }}>
              <text />
              <inline type="TOPIC">topic</inline>
              <text />
            </block>
          </document>
        </value>
      )
      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })
  // https://www.notion.so/databyss/Demo-error-7-If-you-click-location-and-press-return-it-doesn-t-move-the-cursor-but-it-makes-everyth-9eaa6b3f02c04358b42f00159863a355
  it('it should toggle location on empty line using the format menu', () => {
    cy.get('@editor')
      .nextBlock()
      .startOfLine()
      .newLine()
      .wait(500)
      .previousBlock()

    cy.get('@editor')
      .get('[data-test-block-menu="open"]')
      .click()
      .get('[data-test-block-menu="TOPIC"]')
      .click()
      .get('@editor')
      .newLine()
      .wait(500)

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="SOURCE" data={{ refId: refIdList[0], type: 'SOURCE' }}>
              <text />
              <inline type="SOURCE">
                Stamenov, Language Structure, Discourse and the Access to
                Consciousness
              </inline>
              <text />
            </block>
            <block type="ENTRY" data={{ refId: refIdList[1], type: 'ENTRY' }} />
            <block type="ENTRY" data={{ refId: refIdList[2], type: 'ENTRY' }} />
            <block type="ENTRY" data={{ refId: refIdList[3], type: 'ENTRY' }}>
              On the limitation of third-order thought to assertion
            </block>
            <block type="TOPIC" data={{ refId: refIdList[4], type: 'TOPIC' }}>
              <text />
              <inline type="TOPIC">topic</inline>
              <text />
            </block>
          </document>
        </value>
      )
      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })
})
