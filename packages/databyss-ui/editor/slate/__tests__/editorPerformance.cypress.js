/** @jsx h */

/* eslint-disable func-names */

import h from 'slate-hyperscript'
import { toSlateJson, matchExpectedJson } from './_helpers'
// import {  } from './../hotKeys'

context('Editor Menu Actions', () => {
  beforeEach(() => {
    cy.visit('http://localhost:6006/iframe.html?id=cypress-tests--performance')
    cy.get('[contenteditable="true"]')
      .as('editor')
      .focus()
    cy.get('#minimum').as('minimum')
    cy.get('#activeBlockId').as('activeBlockId')
  })

  it('renders the contenteditable container', () => {
    cy.get('@editor').should('have.attr', 'role')
  })

  it('gets minimum threshold', () => {
    cy.get('@activeBlockId').then(id => {
      if (id.text().length > 0) {
        cy.get('[data-test-min="true"]').click()
        cy.wait(500)

        cy.get('@editor')
          .focus()
          .startOfDoc()
          .endOfLine()
          .newLine()
          .wait(500)
        cy.get('@minimum').then(min => {
          console.log(min.text())
        })
      }
    })

    //   .focus()
    //   .get('[data-test-block-menu="open"]')
    //   .click()
    //   .get('[data-test-block-menu="SOURCE"]')
    //   .click()
    //   .get('@editor')
    //   .type('this should be a source')
    //   .newLine()
    //   .wait(500)

    // cy.get('@minimum').then(min => {
    //   console.log(min)
    //   //   const refIdList = JSON.parse(page.text()).pageBlocks.map(b => b.refId)
    //   //   const expected = toSlateJson(
    //   //     <value>
    //   //       <document>
    //   //         <block type="SOURCE" data={{ refId: refIdList[0], type: 'SOURCE' }}>
    //   //           <text>
    //   //             <inline type="SOURCE">this should be a source</inline>
    //   //           </text>
    //   //         </block>
    //   //         <block type="ENTRY" data={{ refId: refIdList[1], type: 'ENTRY' }} />
    //   //       </document>
    //   //     </value>
    //   //   )
    //   //   cy.get('@slateDocument').then(matchExpectedJson(expected.document))
    // })
  })
})
