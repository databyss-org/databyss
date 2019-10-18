import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { elementAcceptingRef, exactProp } from '@material-ui/utils'
import useEventCallback from './useEventCallback'
import ownerDocument from './ownerDocument'

function mapEventPropToEvent(eventProp) {
  return eventProp.substring(2).toLowerCase()
}

/**
 * Listen for click events that occur somewhere in the document, outside of the element itself.
 * For instance, if you need to hide a menu when people click anywhere else on your page.
 */
const ClickAwayListener = React.forwardRef((props, ref) => {
  const {
    children,
    mouseEvent = 'onClick',
    touchEvent = 'onTouchEnd',
    onClickAway,
  } = props
  const movedRef = React.useRef(false)
  const nodeRef = React.useRef(null)

  // forward changes in nodeRef to component ref
  useEffect(
    () => {
      if (ref) {
        ref.current = nodeRef.current
      }
      return undefined
    },
    [nodeRef.current]
  )

  const handleClickAway = useEventCallback(event => {
    // Ignore events that have been `event.preventDefault()` marked.
    if (event.defaultPrevented) {
      return
    }

    // Do not act if user performed touchmove
    if (movedRef.current) {
      movedRef.current = false
      return
    }

    // The child might render null.
    if (!nodeRef.current) {
      return
    }

    // Multi window support
    const doc = ownerDocument(nodeRef.current)

    if (
      doc.documentElement &&
      doc.documentElement.contains(event.target) &&
      !nodeRef.current.contains(event.target)
    ) {
      onClickAway(event)
    }
  })

  const handleTouchMove = React.useCallback(() => {
    movedRef.current = true
  }, [])

  React.useEffect(
    () => {
      if (touchEvent !== false) {
        const mappedTouchEvent = mapEventPropToEvent(touchEvent)

        document.addEventListener(mappedTouchEvent, handleClickAway)
        document.addEventListener('touchmove', handleTouchMove)

        return () => {
          document.removeEventListener(mappedTouchEvent, handleClickAway)
          document.removeEventListener('touchmove', handleTouchMove)
        }
      }

      return undefined
    },
    [handleClickAway, handleTouchMove, touchEvent]
  )

  React.useEffect(
    () => {
      if (mouseEvent !== false) {
        const mappedMouseEvent = mapEventPropToEvent(mouseEvent)
        document.addEventListener(mappedMouseEvent, handleClickAway)

        return () => {
          document.removeEventListener(mappedMouseEvent, handleClickAway)
        }
      }

      return undefined
    },
    [handleClickAway, mouseEvent]
  )

  return (
    <React.Fragment>
      {React.cloneElement(children, { ref: nodeRef })}
    </React.Fragment>
  )
})

ClickAwayListener.propTypes = {
  /**
   * The wrapped element.
   */
  children: elementAcceptingRef.isRequired,
  /**
   * The mouse event to listen to. You can disable the listener by providing `false`.
   */
  mouseEvent: PropTypes.oneOf(['onClick', 'onMouseDown', 'onMouseUp', false]),
  /**
   * Callback fired when a "click away" event is detected.
   */
  onClickAway: PropTypes.func.isRequired,
  /**
   * The touch event to listen to. You can disable the listener by providing `false`.
   */
  touchEvent: PropTypes.oneOf(['onTouchStart', 'onTouchEnd', false]),
}

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line
  ClickAwayListener['propTypes' + ''] = exactProp(ClickAwayListener.propTypes)
}

export default ClickAwayListener
