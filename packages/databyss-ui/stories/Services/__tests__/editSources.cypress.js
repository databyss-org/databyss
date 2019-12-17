/** @jsx h */

/* eslint-disable func-names */

import { _seedValue1, _seedValue2 } from './initialValue'

const firstSource = {
  firstName: 'first name',
  lastName: 'last name',
  citation: 'second citation',
}

const secondSource = {
  citation: 'second citation',
  name: 'updated source',
}

context('Editor', () => {
  beforeEach(() => {
    cy.visit(
      'http://localhost:6006/iframe.html?id=services-auth--login-accounts'
    )
    cy.wait(4000)
    cy.visit(
      'http://localhost:6006/iframe.html?id=services-page--slate-load-and-save'
    )
    cy.wait(4000)
  })

  it('Edits atomic sources', () => {
    cy.get('button').then(buttonList => {
      // clicks on first page
      buttonList[1].click()
      cy.wait(2000)
      cy.get('[contenteditable="true"]').as('editor')
      cy.get('#slateDocument').as('slateDocument')
    })
    cy.get('@editor')
      .get('[data-test-atomic-edit="open"]')
      .click()
      .wait(2000)
    cy.get('#citation')
      .focus()
      .type(firstSource.citation)
    cy.get('#firstName')
      .focus()
      .type(firstSource.firstName)
    cy.get('#lastName')
      .focus()
      .type(firstSource.lastName)

    cy.get('button').then(buttonList => {
      buttonList[4].click()
    })

    cy.get('@editor')
      .focus()
      .endOfDoc()
      .newLine()
      .type('@new source')
      .newLine()
      .get('[data-test-atomic-edit="open"]')
      .then(buttonList => {
        buttonList[1].click()
        cy.wait(2000)
          .get('#name')
          .focus()
          .type('{rightarrow}')
          .type('{rightarrow}')
          .type('{rightarrow}')
          .type('{rightarrow}')
          .type('{backspace}')
          .type('{backspace}')
          .type('{backspace}')
          .type('updated')
        cy.get('#citation')
          .focus()
          .type(secondSource.citation)
          .wait(1000)

        cy.get('button').then(buttonList => {
          buttonList[5].click()
        })
        // wait for autosave
        cy.wait(11000)
      })
    // reload the page
    cy.reload().wait(2000)
    cy.get('button').then(buttonList => {
      buttonList[1].click()
      cy.wait(2000)
    })

    cy.get('@editor')
      .focus()
      .get('[data-test-atomic-edit="open"]')
      .then(buttonList => {
        buttonList[0].click()
        cy.wait(2000)
        cy.get('#firstName')
          .invoke('val')
          .then(str => {
            expect(str).to.deep.equal(firstSource.firstName)
          })
        cy.get('#lastName')
          .invoke('val')
          .then(str => {
            expect(str).to.deep.equal(firstSource.lastName)
          })
        cy.get('#citation')
          .focus()
          .invoke('text')
          .then(str => {
            expect(str).to.deep.equal(firstSource.citation)
          })
        cy.get('button').then(buttonList => {
          buttonList[5].click()
        })

        // reload the page
      })

    cy.get('@editor')
      .focus()
      .get('[data-test-atomic-edit="open"]')
      .then(buttonList => {
        buttonList[1].click()
        cy.get('#name')
          .focus()
          .invoke('text')
          .then(str => {
            expect(str).to.deep.equal(secondSource.name)
          })
        cy.get('#citation')
          .focus()
          .invoke('text')
          .then(str => {
            expect(str).to.deep.equal(secondSource.citation)
          })
      })
  })
})

// -- move value list story into sources
// -- move edit atomic blcks to page, (should be the same functionality)
// creat fully mocked version of page demo
// have a seeded page ready
// have first text control fully focused
// right width vairant
// check  modals/ editable
// width variable 'form' put that on window
// check for enter on first line test
// leave arrow in
// focus editor when source is updated

// cy.get('#firstName')
// .invoke('val') // for input or textarea, .invoke('val')
// .then(str => console.log(str))
