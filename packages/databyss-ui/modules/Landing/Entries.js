import React from 'react'
import injectSheet from 'react-jss'
import ContentNav from '../../components/Navigation/ContentNav'
import BackButton from '../../components/Button/BackButton'
import styles from './styles'

const Entries = ({ children, onSourcesClick }) => (
  <ContentNav left={<BackButton label="Sources" onClick={onSourcesClick} />}>
    {children}
  </ContentNav>
)

export default injectSheet(styles)(Entries)
