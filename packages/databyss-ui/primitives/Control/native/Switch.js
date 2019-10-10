import React from 'react'
import timing from '../../../theming/timing'
import colors from '../../../theming/colors'
import { borderRadius } from '../../../theming/theme'

const toggleCss = {
  boxSizing: 'border-box',
  width: '35px',
  height: '20px',
  backgroundColor: colors.gray[4],
  border: `1px solid ${colors.gray[2]}`,
  borderRadius,
  position: 'relative',
  transition: `all ${timing.quick}ms ${timing.ease}`,
  flexShrink: 0,
}

const handleCss = {
  content: '""',
  boxSizing: 'border-box',
  background: '#ffffff',
  border: `1px solid ${colors.gray[5]}`,
  boxShadow:
    '0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 2px 1px -1px rgba(0, 0, 0, 0.12)',
  borderRadius,
  position: 'absolute',
  transition: `all ${timing.quick}ms ${timing.ease}`,
  left: 0,
  top: 0,
  width: '18px',
  height: '18px',
}

const handleCheckedCss = {
  left: '15px',
}

export default ({ value, disabled }) => (
  <div css={toggleCss} style={{ opacity: disabled ? 0.5 : 1 }}>
    <div css={[handleCss, value && handleCheckedCss]} />
  </div>
)
