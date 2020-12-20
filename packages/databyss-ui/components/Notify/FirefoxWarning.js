import React from 'react'
import StickyMessage from '@databyss-org/ui/components/Notify/StickyMessage'

const FIREFOX_WARNING =
  'Databyss was built to run best on Chromium- and WebKit-based browsers (such as Chrome, Safari, Edge, Brave, Iron). At this time, we cannot guarantee the best experience on Firefox.'

const IS_FIREFOX = navigator.userAgent.search('Firefox') >= 0

const FirefoxWarning = () =>
  IS_FIREFOX ? (
    <StickyMessage html={FIREFOX_WARNING} messageId="warnfirefox" />
  ) : null

export default FirefoxWarning
