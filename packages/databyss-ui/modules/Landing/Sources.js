import React from 'react'
import injectSheet from 'react-jss'
import TocList from '../../components/List/TocList'
import ContentNav from '../../components/Navigation/ContentNav'
import ForwardButton from '../../components/Button/ForwardButton'
import styles from './styles'

const Sources = ({ classes, sources, renderSource }) => (
  <ContentNav right={<ForwardButton label="All Entries" />}>
    <TocList ariaLabel="sources" className={classes.sourcesToc}>
      {sources.map(source =>
        React.cloneElement(renderSource(source), { key: source.id })
      )}
    </TocList>
  </ContentNav>
)

export default injectSheet(styles)(Sources)
