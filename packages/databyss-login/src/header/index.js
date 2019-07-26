import React from 'react'
import { Row, Col } from 'react-flexbox-grid'
import { Link } from 'react-router-dom'

const Header = () => (
  <header className="App-header">
    <Row>
      <Col xs={12}>
        <Row between="xs">
          <Col xs={2} md={1}>
            <Link to="/" style={{ textDecoration: 'none', color: 'black' }}>
              Databyss
            </Link>
          </Col>
          <Col xs={4} md={4}>
            <Row around="xs">
              <Col xs={6}>
                <Link
                  to="/login"
                  style={{ textDecoration: 'none', color: 'black' }}
                >
                  Login
                </Link>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  </header>
)

export default Header
