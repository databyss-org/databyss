/** @jsx h */

import { authenticate } from './_helpers'

/* eslint-disable func-names */

const _topic = {
  text: 'this is an updated a new topic',
}

context('Editor - Topics Provider', () => {
  beforeEach(() => {
    authenticate()
    cy.visit(
      'http://localhost:6006/iframe.html?id=services-page--slate-load-and-save'
    )
    cy.wait(4000)
    cy.get('[contenteditable="true"]').as('editor')
    cy.get('#slateDocument').as('slateDocument')
  })

  it('Edits Topics sources', () => {
    cy.get('@editor')
      .type('{rightarrow}')
      .endOfLine()
      .endOfDoc()
      .newLine()
      .wait(500)
      .type('#this is a new topic')
      .newLine()
      .wait(500)
      .type('this is a regular entry')
      .setSelection('this is a new topic')
      .get('[data-test-atomic-edit="open"]')
      .click()
      .wait(1000)
      .get('#name')
      .focus()
      .type('{rightarrow}')
      .type('{rightarrow}')
      .type('{rightarrow}')
      .type('{rightarrow}')
      .type('{rightarrow}')
      .type('{rightarrow}')
      .type('{rightarrow}')
      .type('{rightarrow}')
      .type(' an updated')
    // hit done and wait for autosave
    cy.get('button')
      .then(buttonList => {
        buttonList[4].click()
      })
      .wait(3000)
    // reload the page
    cy.reload()
      .wait(2000)
      .get('@editor')
      .type('{rightarrow}')
      .setSelection('this is an updated a new topic')
      .get('[data-test-atomic-edit="open"]')
      .click()
      .get('#name')
      .focus()
      .invoke('text')
      .then(str => {
        expect(str).to.deep.equal(_topic.text)
      })
  })
})
