/** @jsx h */

/* eslint-disable func-names */

import h from 'slate-hyperscript'
import { toSlateJson, matchExpectedJson } from './_helpers'

context('Editor', () => {
  beforeEach(() => {
    cy.visit('http://0.0.0.0:6006/iframe.html?id=editor-tests--slate')
    cy.get('[contenteditable="true"]')
      .as('editor')
      .focus()
    cy.get('#slateDocument').as('slateDocument')
  })

  it('renders the contenteditable container', () => {
    cy.get('@editor').should('have.attr', 'role')
  })

  it('should set initial blocks and inlines', () => {
    const expected = toSlateJson(
      <value>
        <document>
          <block type="SOURCE">
            <text />
            <inline type="SOURCE">
              Stamenov, Language Structure, Discourse and the Access to
              Consciousness
            </inline>
            <text />
          </block>
          <block type="ENTRY">
            On the limitation of third-order thought to assertion
          </block>
          <block type="TOPIC">
            <text />
            <inline type="TOPIC">topic</inline>
            <text />
          </block>
        </document>
      </value>
    )

    cy.get('@slateDocument').then(matchExpectedJson(expected.document))
  })

  it('should set @ block to SOURCE on blur', () => {
    cy.get('@editor')
      .type(
        '{downarrow}{downarrow}{downarrow}{downarrow}{backspace}this is a source'
      )
      // .type('{downarrow}')
      // .type('{downarrow}')
      // .type('{downarrow}')
      // .type('{backspace}')
      // .type('this is a source')
      .type('{alt}{uparrow}')
      .type('@{uparrow}')
    // .type('{uparrow}')

    const expected = toSlateJson(
      <value>
        <document>
          <block type="SOURCE">
            <text />
            <inline type="SOURCE">
              Stamenov, Language Structure, Discourse and the Access to
              Consciousness
            </inline>
            <text />
          </block>
          <block type="ENTRY">
            On the limitation of third-order thought to assertion
          </block>
          <block type="SOURCE">
            <text />
            <inline type="SOURCE">this is a source</inline>
            <text />
          </block>
        </document>
      </value>
    )
    cy.get('@slateDocument').then(matchExpectedJson(expected.document))
  })

  it('Should not allow content/range change on atomic blocks', () => {
    cy.get('@editor')
      .type('{downarrow}')
      .type('{downarrow}')
      .type('{downarrow}')
      .type('{downarrow}')
      .type('{meta}b')
      .type('this should not be allowed')
      .type('{uparrow}')

    const expected = toSlateJson(
      <value>
        <document>
          <block type="SOURCE">
            <text />
            <inline type="SOURCE">
              Stamenov, Language Structure, Discourse and the Access to
              Consciousness
            </inline>
            <text />
          </block>
          <block type="ENTRY">
            On the limitation of third-order thought to assertion
          </block>
          <block type="TOPIC">
            <text />
            <inline type="TOPIC">topic</inline>
            <text />
          </block>
        </document>
      </value>
    )
    cy.get('@slateDocument').then(matchExpectedJson(expected.document))
  })

  it('should escape html on block type change and allow bold', () => {
    cy.get('@editor')
      .type('{downarrow}')
      .type('{downarrow}')
      .type('{downarrow}')
      .type('{downarrow}')
      .type('{backspace}')
      .type('@this is ')
      .type('{meta}b')
      .type('bold and not ')
      .type('{meta}b')
      .type('<i>italic</i>')
      .type('{uparrow}')

    const expected = toSlateJson(
      <value>
        <document>
          <block type="SOURCE">
            <text />
            <inline type="SOURCE">
              Stamenov, Language Structure, Discourse and the Access to
              Consciousness
            </inline>
            <text />
          </block>
          <block type="ENTRY">
            On the limitation of third-order thought to assertion
          </block>
          <block type="SOURCE">
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
        </document>
      </value>
    )
    cy.get('@slateDocument').then(matchExpectedJson(expected.document))
  })

  it('should escape html on block type change and allow italic', () => {
    cy.get('@editor')
      .type('{downarrow}')
      .type('{downarrow}')
      .type('{downarrow}')
      .type('{downarrow}')
      .type('{backspace}')
      .type('@this is ')
      .type('{meta}i')
      .type('italic and not ')
      .type('{meta}i')
      .type('<strong>bold</strong>')
      .type('{uparrow}')

    const expected = toSlateJson(
      <value>
        <document>
          <block type="SOURCE">
            <text />
            <inline type="SOURCE">
              Stamenov, Language Structure, Discourse and the Access to
              Consciousness
            </inline>
            <text />
          </block>
          <block type="ENTRY">
            On the limitation of third-order thought to assertion
          </block>
          <block type="SOURCE">
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
        </document>
      </value>
    )
    cy.get('@slateDocument').then(matchExpectedJson(expected.document))
  })
})
