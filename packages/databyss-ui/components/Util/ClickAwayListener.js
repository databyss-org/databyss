import React from 'react'
import PropTypes from 'prop-types'
import { elementAcceptingRef, exactProp } from '@material-ui/utils'
import useEventCallback from '../../lib/useEventCallback'
import ownerDocument from '../../lib/ownerDocument'
import forkRef from '../../lib/forkRef'

function mapEventPropToEvent(eventProp) {
  return eventProp.substring(2).toLowerCase()
}

/**
 * Listen for click events that occur somewhere in the document, outside of the element itself.
 * For instance, if you need to hide a menu when people click anywhere else on your page.
 */
const ClickAwayListener = (props) => {
  const {
    children,
    mouseEvents = ['onClick', 'onContextMenu'],
    touchEvents = ['onTouchEnd'],
    additionalNodeRefs = [],
    onClickAway,
  } = props
  const movedRef = React.useRef(false)
  const nodeRef = React.useRef(null)

  const handleClickAway = useEventCallback((event) => {
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

    const nodeRefList = [nodeRef, ...additionalNodeRefs]

    // Multi window support
    const shouldClickAway = nodeRefList.reduce((acc, _nodeRef) => {
      const doc = ownerDocument(_nodeRef.current)
      if (
        doc.documentElement &&
        doc.documentElement.contains(event.target) &&
        !_nodeRef.current.contains(event.target)
      ) {
        return acc
      }
      return false
    }, true)

    if (shouldClickAway) {
      onClickAway(event)
    }
  })

  const handleTouchMove = React.useCallback(() => {
    movedRef.current = true
  }, [])

  React.useEffect(() => {
    touchEvents.forEach((touchEvent) => {
      const mappedTouchEvent = mapEventPropToEvent(touchEvent)

      document.addEventListener(mappedTouchEvent, handleClickAway)
      document.addEventListener('touchmove', handleTouchMove)
    })
    return () => {
      touchEvents.forEach((touchEvent) => {
        const mappedTouchEvent = mapEventPropToEvent(touchEvent)

        document.removeEventListener(mappedTouchEvent, handleClickAway)
        document.removeEventListener('touchmove', handleTouchMove)
      })
    }
  }, [handleClickAway, handleTouchMove, touchEvents])

  React.useEffect(() => {
    mouseEvents.forEach((mouseEvent) => {
      const mappedMouseEvent = mapEventPropToEvent(mouseEvent)
      document.addEventListener(mappedMouseEvent, handleClickAway, {
        capture: true,
      })
    })

    return () => {
      mouseEvents.forEach((mouseEvent) => {
        const mappedMouseEvent = mapEventPropToEvent(mouseEvent)
        document.removeEventListener(mappedMouseEvent, handleClickAway)
      })
    }
  }, [handleClickAway, mouseEvents])

  return (
    <React.Fragment>
      {React.cloneElement(children, { ref: forkRef(children.ref, nodeRef) })}
    </React.Fragment>
  )
}

ClickAwayListener.propTypes = {
  /**
   * The wrapped element.
   */
  children: elementAcceptingRef.isRequired,
  /**
   * The mouse event to listen to. You can disable the listener by providing `false`.
   */
  mouseEvents: PropTypes.arrayOf(
    PropTypes.oneOf(['onClick', 'onMouseDown', 'onMouseUp', false])
  ),
  /**
   * Callback fired when a "click away" event is detected.
   */
  onClickAway: PropTypes.func.isRequired,
  /**
   * The touch event to listen to. You can disable the listener by providing `false`.
   */
  touchEvents: PropTypes.arrayOf(
    PropTypes.oneOf(['onTouchStart', 'onTouchEnd', false])
  ),
  /**
   * In addition to the child node, we whitelist these node refs so they do not trigger a "click away" event
   */
  additionalNodeRefs: PropTypes.arrayOf(PropTypes.shape({})),
}

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line
  ClickAwayListener['propTypes' + ''] = exactProp(ClickAwayListener.propTypes)
}

export default ClickAwayListener
