import React from 'react'
import injectSheet from 'react-jss'
import SwitchControl from '../../components/Control/SwitchControl'
import ContentNav from '../../components/Navigation/ContentNav'
import BackButton from '../../components/Button/BackButton'
import styles from './styles'

const MotifEntries = ({
  classes,
  showMotifLinks,
  onMotifLinksChange,
  children,
}) => (
  <ContentNav
    left={<BackButton label="Sources" />}
    right={
      <SwitchControl
        label="Motif Links"
        checked={showMotifLinks}
        onChange={onMotifLinksChange}
        className={classes.motifLinksSwitch}
      />
    }
  >
    {children}
  </ContentNav>
)

export default injectSheet(styles)(MotifEntries)
