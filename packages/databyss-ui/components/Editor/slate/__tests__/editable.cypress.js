context('Editor', () => {
  beforeEach(() => {
    cy.visit('http://0.0.0.0:6006/iframe.html?id=editor-tests--slate')
  })

  // https://on.cypress.io/interacting-with-elements
  it('renders the contenteditable container', () => {
    // https://on.cypress.io/focus
    cy.get('[contenteditable="true"]')
      .focus()
      .should('have.attr', 'role')
  })
})
