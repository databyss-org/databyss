import React from 'react'
import ReactModal from 'react-modal'
import injectSheet from 'react-jss'
import DropDown from './../Control/Dropdown'
import CloseButton from './../Button/CloseButton'
import styles from './styles'

class CfMobileModal extends React.Component {
  constructor() {
    super()
    this.state = {
      showModal: false,
    }

    this.handleOpenModal = this.handleOpenModal.bind(this)
    this.handleCloseModal = this.handleCloseModal.bind(this)
  }

  clickHandler(id) {
    if (id) {
      this.handleCloseModal()
      this.props.onSelect(id)
    }
  }

  handleOpenModal() {
    this.setState({ showModal: true })
  }

  handleCloseModal() {
    this.setState({ showModal: false })
  }

  render() {
    const { classes, list } = this.props
    let authorList = []
    if (list) {
      list.sort((a, b) => (a.lastName > b.lastName ? 1 : -1))
      authorList = list.map((a, i) => (
        <div className={classes.authorsModal} key={i}>
          <div className={classes.borderBottom}>
            <a
              className={classes.authorName}
              onClick={() => this.clickHandler(a.id)}
              onKeyPress={() => this.clickHandler(a.id)}
              role="button"
              tabIndex={0}
            >
              {a.lastName}
            </a>
          </div>
        </div>
      ))
    }
    return (
      <div className={classes.modalContainer}>
        <div
          onClick={this.handleOpenModal}
          onKeyPress={this.handleOpenModal}
          role="button"
          tabIndex={0}
        >
          <DropDown list={list} isModalDisabled />
        </div>

        <ReactModal
          style={{
            overlay: {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 5,
            },
            content: {
              position: 'absolute',
              top: `${this.props.appBarCalculatedHeight - 20}px`,
              left: '0px',
              right: '0px',
              bottom: '0px',
              overflow: 'auto',
              WebkitOverflowScrolling: 'touch',
              border: 'none',
              outline: 'none',
              padding: '0px',
            },
          }}
          appElement={this.props.parentRef}
          isOpen={this.state.showModal}
          contentLabel="see all authors"
        >
          <div className={classes.modalTitle}>
            <div className={classes.modalHeader}>{this.props.modalTitle}</div>
            <div className={classes.close}>
              <CloseButton onClick={this.handleCloseModal} ariaLabel="back" />
            </div>
          </div>

          <p className={classes.info}> see also </p>

          <div className={classes.listContainer}>{authorList}</div>
        </ReactModal>
      </div>
    )
  }
}

export default injectSheet(styles)(CfMobileModal)
