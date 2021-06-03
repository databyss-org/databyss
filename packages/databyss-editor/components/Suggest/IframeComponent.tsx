import React, { useMemo } from 'react'
import { View } from '@databyss-org/ui/primitives'
import colors from '@databyss-org/ui/theming/colors'
import { MediaTypes } from '@databyss-org/services/interfaces/Block'

const { gray, orange } = colors
export const IframeComponent = ({ src, height, width, mediaType, highlight }) =>
  useMemo(
    () => (
      <div
        style={{
          width,
          height,
          border: 2,
          borderStyle: 'solid',
          borderColor: highlight ? orange[0] : `rgba(0,0,0,0.0)`,
        }}
      >
        {mediaType === MediaTypes.HTML ? (
          <View backgroundColor={gray[6]}>
            <iframe
              id={src}
              title={src}
              srcDoc={src}
              width={width}
              height={height}
              // border="0px"
              frameBorder="0px"
            />
          </View>
        ) : (
          <iframe
            seamless
            id={src}
            title={src}
            src={src}
            // border="0px"
            frameBorder="0px"
            height={height}
            width={width}
          />
        )}
      </div>
    ),
    [src]
  )
