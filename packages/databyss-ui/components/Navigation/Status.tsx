import React, { useRef, useEffect, useState, useMemo } from 'react'
import { getDbBusy } from '@databyss-org/data/pouchdb/utils'
import { getBusy as getDriveBusy } from '@databyss-org/data/drivedb/sync'
import { View } from '../..'
import { useNotifyContext } from '../Notify/NotifyProvider'

export const Status = React.memo(() => {
  const initStatus = {
    isBusy: false,
    writesPending: 0,
    uploadsPending: 0,
  }
  const prevStatusRef = useRef(initStatus)
  const timerRef = useRef(0)
  const [dbStatus, setDbStatus] = useState(initStatus)
  const { isOnline } = useNotifyContext()

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      const status = getDbBusy()
      const driveStatus = getDriveBusy()
      if (
        (prevStatusRef.current.isBusy ||
          prevStatusRef.current.writesPending > 0 ||
          prevStatusRef.current.uploadsPending > 0) &&
        ((!status.isBusy && !driveStatus.isBusy) ||
          (status.writesPending === 0 && driveStatus.writesPending === 0))
      ) {
        prevStatusRef.current = initStatus
        setDbStatus(initStatus)
      }
      if (
        !prevStatusRef.current.isBusy &&
        (status.writesPending > 5 || driveStatus.writesPending > 0)
      ) {
        prevStatusRef.current = {
          isBusy: status.isBusy || driveStatus.isBusy,
          writesPending: status.writesPending,
          uploadsPending: driveStatus.writesPending,
        }
        setDbStatus(prevStatusRef.current)
      }
    }, 1000)
    return () => window.clearInterval(timerRef.current)
  }, [])

  let statusMessage =
    'Databyss is up to date.\nAll your changes have been synched to the cloud.'
  if (!isOnline) {
    statusMessage =
      'Databyss is offline.\nYour changes are being saved locally and will be synched when you go back online.'
  } else if (dbStatus.isBusy) {
    statusMessage = `Databyss is getting back in sync.`
    if (dbStatus.writesPending) {
      statusMessage += `\n${dbStatus.writesPending} pending local changes`
    }
    if (dbStatus.uploadsPending) {
      statusMessage += `\n${dbStatus.uploadsPending} pending uploads`
    }
  }

  return useMemo(
    () => (
      <View alignItems="center" justifyContent="flex-end" flexDirection="row">
        {!dbStatus.isBusy && (
          <View id="changes-saved">
            {' '}
            &nbsp;
            {/* this is used in tests to confirm the page has been saved */}
          </View>
        )}
        <View
          backgroundColor={
            !isOnline || dbStatus.isBusy ? 'orange.2' : 'green.0'
          }
          title={statusMessage}
          p="extraSmall"
          borderRadius="round"
        />
      </View>
    ),
    [dbStatus.isBusy, statusMessage]
  )
})
