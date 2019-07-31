import { macros } from '../../theming'

export default () => ({
  commaSeparatedList: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  listItem: {
    ...macros.commas(),
    '&:last-child': {
      marginRight: '1px',
    },
    '&:first-child': {
      marginLeft: '2px',
    },
  },

  tocList: {
    display: 'flex',
    flexDirection: 'column',
  },
  item: {
    marginBottom: '0.7em',
  },
})
