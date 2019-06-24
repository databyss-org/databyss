import React from 'react'
import injectSheet from 'react-jss'
import FullscreenModal from './FullscreenModal'
import DropDown from './../Control/Dropdown'
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
        {this.state.showModal && (
          <FullscreenModal
            onDismiss={() => this.handleCloseModal()}
            title={
              <div className={classes.modalTitle}>
                <div className={classes.modalHeader}>
                  {this.props.modalTitle}
                </div>
              </div>
            }
            subtitle={<p className={classes.info}> see also </p>}
            appElementId="root"
          >
            <div>{authorList}</div>
          </FullscreenModal>
        )}
      </div>
    )
  }
}

export default injectSheet(styles)(CfMobileModal)
