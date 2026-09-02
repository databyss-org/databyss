import React from 'react'
import { Helmet } from 'react-helmet'
import View from '@databyss-org/ui/primitives/View/View'
import Text from '@databyss-org/ui/primitives/Text/Text'
import Button from '@databyss-org/ui/primitives/Button/Button'
import RawHtml from '@databyss-org/ui/primitives/Text/RawHtml'
import { darkTheme, pxUnits } from '@databyss-org/ui/theming/theme'

const linkStyle = 'color:#7D7DE8;text-decoration:underline;'

const Migrate = () => (
  <View
    minHeight="100vh"
    width="100%"
    theme={darkTheme}
    backgroundColor="#191919"
    alignItems="center"
    justifyContent="center"
  >
    <Helmet>
      <title>Databyss is now a desktop app!</title>
    </Helmet>
    <View widthVariant="form" width="100%" alignItems="center" px="medium">
      <Button
        variant="uiTextButton"
        borderRadius="default"
        href="/"
        target="_top"
        childViewProps={{ flexDirection: 'row', alignItems: 'center' }}
        css={{ textDecoration: 'none' }}
        mb="medium"
      >
        <View mr="small">
          <img
            width={pxUnits(60)}
            src={require('@databyss-org/ui/assets/logo-thick.png')}
            alt="Logo"
          />
        </View>
      </Button>

      <Text variant="heading3" color="text.0" textAlign="center" mb="medium">
        Databyss is now a desktop app!
      </Text>

      <RawHtml
        variant="uiTextNormal"
        color="text.2"
        mb="large"
        html={`<div style="text-align:center;">We have retired the web-based version of Databyss and encourage you to move to the <a href="/" target="_top" style="${linkStyle}">desktop version</a>. You should have received an email with links to download your data and instructions for moving to the <a href="/" target="_top" style="${linkStyle}">desktop app</a>.</div>`}
      />

      <View
        widthVariant="dialog"
        width="100%"
        alignItems="center"
        mb="large"
        p="medium"
        css={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: pxUnits(8),
        }}
      >
        <Text variant="uiTextNormal" color="text.0" textAlign="center">
          Didn&apos;t receive the email? Don&apos;t worry, your data hasn&apos;t
          been deleted! Contact us through a channel linked below and we&apos;ll
          help you find it.
        </Text>
      </View>

      <Text
        variant="uiTextNormal"
        color="text.2"
        textAlign="center"
        mb="medium"
      >
        Your data will continue to be available from the links in the email for
        at least one year.
      </Text>

      <RawHtml
        variant="uiTextNormal"
        color="text.2"
        mb="small"
        html={`<div style="text-align:center;">Questions or concerns?<br /><a href="mailto:migration@databyss.org" target="_top" style="${linkStyle}">Email us</a> or <a href="https://discord.gg/jyQVawQM2Q" target="_blank" rel="noopener noreferrer" style="${linkStyle}">chat with us on Discord</a>.</div>`}
      />
    </View>
  </View>
)

export default Migrate
