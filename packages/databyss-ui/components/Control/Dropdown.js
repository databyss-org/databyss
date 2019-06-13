import React from 'react'
import Select from 'react-select'
import injectSheet from 'react-jss'
import styles from './styles'

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#f2efeb' : 'white',
    color: '#4a4a4a',
    fontSize: '0.9em',
    ':active': { backgroundColor: '#a19f9c' },
  }),
  control: (provided, state) => ({
    ...provided,
    boxShadow: 'none',
    '&:hover': { borderColor: '#a19f9c' },
    borderColor: state.isSelected ? '#807d79' : '#a19f9c',
  }),

  placeholder: provided => ({
    ...provided,
    fontSize: '0.9em',
  }),
}

class Dropdown extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
    }
  }

  componentDidMount() {
    if (this.props.list) {
      this.updateList(this.props.list)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.list !== nextProps.list) {
      this.updateList(this.props.list)
    }
  }

  updateList(rawList) {
    const newList = rawList.reduce((acc, d) => {
      acc.push({ label: d.lastName, value: d.id })
      return acc
    }, [])
    this.setState({ list: newList })
  }

  render() {
    const { classes, onSelect } = this.props
    const list = this.state.list
    return list.length > 0 ? (
      <div>
        <p className={classes.dropdownTitle}>cf.</p>
        <div className={classes.dropdown}>
          <Select
            value={null}
            style={{ boxShadow: 'none', outline: 'none' }}
            styles={customStyles}
            captureMenuScroll={false}
            placeholder={`${list.length} author${list.length > 1 ? 's' : ''}`}
            onChange={id => onSelect(id)}
            options={list}
          />
        </div>
      </div>
    ) : null
  }
}

export default injectSheet(styles)(Dropdown)
