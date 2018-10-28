import { macros } from '../../shared-styles'

export default () => ({
  commaSeparatedList: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  listItem: {
    ...macros.commas(),
  },

  tocList: {
    display: 'flex',
    flexDirection: 'column',
  },
  item: {
    marginBottom: '0.7em',
  },
})
