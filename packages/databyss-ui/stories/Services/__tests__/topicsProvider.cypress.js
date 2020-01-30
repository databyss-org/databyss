/** @jsx h */

/* eslint-disable func-names */

const _topic = {
  text: 'this is an updated a new topic',
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
      buttonList[0].click()
      cy.wait(2000)
      cy.get('[contenteditable="true"]').as('editor')
      cy.get('#slateDocument').as('slateDocument')
    })
    cy.get('@editor')
      .type('{rightarrow}')
      .endOfDoc()
      .newLine()
      .type('#this is a new topic')
      .newLine()
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
      .wait(11000)
    // reload the page
    cy.reload().wait(2000)
    cy.get('button')
      .then(buttonList => {
        buttonList[0].click()
        cy.wait(2000)
      })
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
