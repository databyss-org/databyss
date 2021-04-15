import React from 'react'
import StickyMessage from '@databyss-org/ui/components/Notify/StickyMessage'

const MOBILE_WARNING =
  'Databyss works on mobile, but with limited functionality. Your pages are read-only, and there is no search at this time.'

const MobileWarning = () =>
  process.env.FORCE_MOBILE ? (
    <StickyMessage html={MOBILE_WARNING} messageId="warnmobile" />
  ) : null

export default MobileWarning
