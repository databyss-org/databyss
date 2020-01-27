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
            <block type="ENTRY" data={{ refId: refIdList[0], type: 'ENTRY' }}>
              <text />
            </block>
          </document>
        </value>
      )

      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })

  it('should set @ block to SOURCE on blur', () => {
    cy.get('@editor')
      .type('@this is a source')
      .newLine()
      .wait(500)

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="SOURCE" data={{ refId: refIdList[0], type: 'SOURCE' }}>
              <text />
              <inline type="SOURCE">this is a source</inline>
              <text />
            </block>
            <block type="ENTRY" data={{ refId: refIdList[1], type: 'ENTRY' }} />
          </document>
        </value>
      )
      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })

  it('Should not allow content/range change on atomic blocks', () => {
    cy.get('@editor')
      .type('@this is a source')
      .newLine()
      .previousBlock()
      .toggleBold()
      .type('this should not be allowed')
      .nextBlock()
      .wait(500)

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="SOURCE" data={{ refId: refIdList[0], type: 'SOURCE' }}>
              <text />
              <inline type="SOURCE">this is a source</inline>
              <text />
            </block>
            <block type="ENTRY" data={{ refId: refIdList[1], type: 'ENTRY' }} />
          </document>
        </value>
      )
      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })

  it('should escape html on block type change and allow bold', () => {
    cy.get('@editor')
      .type('@this is ')
      .toggleBold()
      .type('bold and not ')
      .toggleBold()
      .type('<i>italic</i>')
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
                <mark type="bold">
                  {
                    'this is <strong>bold and not </strong>&lt;i&gt;italic&lt;/i&gt;'
                  }
                </mark>
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

  it('should escape html on block type change and allow italic', () => {
    cy.get('@editor')
      .type('@this is ')
      .toggleItalic()
      .type('italic and not ')
      .toggleItalic()
      .type('<strong>bold</strong>')
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
                <mark type="italic">
                  {
                    'this is <em>italic and not </em>&lt;strong&gt;bold&lt;/strong&gt;'
                  }
                </mark>
              </inline>
              <text />
            </block>
            <block type="ENTRY" data={{ refId: refIdList[1] }} />
          </document>
        </value>
      )
      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })
  it('should toggle a location mark and tag block as location, then split up block into two location blocks', () => {
    cy.get('@editor')
      .toggleLocation()
      .type('this whole block should get tagged as a location')
      .startOfLine()
      .type('{rightarrow}')
      .type('{rightarrow}')
      .type('{rightarrow}')
      .type('{rightarrow}')
      .type('{rightarrow}')
      .newLine()
      .wait(500)
    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block
              type="LOCATION"
              data={{ refId: refIdList[0], type: 'ENTRY' }}
            >
              <mark type="location">this </mark>
            </block>
            <block
              type="LOCATION"
              data={{ refId: refIdList[1], type: 'ENTRY' }}
            >
              <mark type="location">
                whole block should get tagged as a location
              </mark>
            </block>
          </document>
        </value>
      )
      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })

  it('should toggle inline location mark', () => {
    cy.get('@editor')
      .type('this block has an ')
      .toggleLocation()
      .type('inline location')
      .toggleLocation()
      .type(' within an entry')
      .newLine()
      .wait(500)
    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="ENTRY" data={{ refId: refIdList[0], type: 'ENTRY' }}>
              <text>this block has an </text>
              <mark type="location">inline location</mark>
              <text> within an entry</text>
            </block>
            <block type="ENTRY" data={{ refId: refIdList[1], type: 'ENTRY' }} />
          </document>
        </value>
      )
      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })

  it('should toggle LOCATION type then go back to ENTRY when location toggle is entered within the entry', () => {
    cy.get('@editor')
      .toggleLocation()
      .type('this whole block should get tagged as an ')
      .toggleLocation()
      .type('entry')
      .newLine()
      .wait(500)
    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block type="ENTRY" data={{ refId: refIdList[0] }}>
              <text>
                <mark type="location">
                  this whole block should get tagged as an{' '}
                </mark>
              </text>
              entry
              <text />
            </block>
            <block type="ENTRY" data={{ refId: refIdList[1] }} />
          </document>
        </value>
      )
      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })

  it('should toggle a location mark and tag block as location', () => {
    cy.get('@editor')
      .focus()
      .toggleLocation()
      .type('this whole block should get tagged as a location')
      .newLine()
      .type('{uparrow}')
      .wait(500)

    cy.get('@pageBlocks').then(page => {
      const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
      const expected = toSlateJson(
        <value>
          <document>
            <block
              type="LOCATION"
              data={{ refId: refIdList[0], type: 'ENTRY' }}
            >
              <mark type="location">
                this whole block should get tagged as a location
              </mark>
            </block>
            <block type="ENTRY" data={{ refId: refIdList[1], type: 'ENTRY' }} />
          </document>
        </value>
      )
      cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    })
  })
})
