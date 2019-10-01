import { configure } from '@storybook/react'
import { setOptions } from '@storybook/addon-options'
import { addParameters } from '@storybook/react'
import { themes } from '@storybook/theming'
import colors from '../packages/databyss-ui/theming/colors'

addParameters({
  darkMode: {
    // Override the default dark theme
    dark: { ...themes.dark, appBg: colors.gray[2] },
  },
})

setOptions({
  /**
   * name to display in the top left corner
   * @type {String}
   */
  name: 'Databyss',
  /**
   * URL for name in top left corner to link to
   * @type {String}
   */
  url: 'https://github.com/databyss-org/',
  /**
   * show story component as full screen
   * @type {Boolean}
   */
  goFullScreen: false,
  /**
   * display panel that shows a list of stories
   * @type {Boolean}
   */
  showStoriesPanel: true,
  /**
   * display panel that shows addon configurations
   * @type {Boolean}
   */
  showAddonPanel: false,
  /**
   * display floating search box to search through stories
   * @type {Boolean}
   */
  showSearchBox: false,
  /**
   * show addon panel as a vertical panel on the right
   * @type {Boolean}
   */
  addonPanelInRight: false,
  /**
   * sorts stories
   * @type {Boolean}
   */
  sortStoriesByKind: false,
  /**
   * regex for finding the hierarchy separator
   * @example:
   *   null - turn off hierarchy
   *   /\// - split by `/`
   *   /\./ - split by `.`
   *   /\/|\./ - split by `/` or `.`
   * @type {Regex}
   */
  hierarchySeparator: null,
  /**
   * regex for finding the hierarchy root separator
   * @example:
   *   null - turn off multiple hierarchy roots
   *   /\|/ - split by `|`
   * @type {Regex}
   */
  hierarchyRootSeparator: null,
  /**
   * sidebar tree animations
   * @type {Boolean}
   */
  sidebarAnimations: true,
  /**
   * id to select an addon panel
   * @type {String}
   */
  selectedAddonPanel: undefined, // The order of addons in the "Addon panel" is the same as you import them in 'addons.js'. The first panel will be opened by default as you run Storybook
  /**
   * enable/disable shortcuts
   * @type {Boolean}
   */
  enableShortcuts: false, // true by default
})

// automatically import all files ending in *.stories.js

const reqs = [
  require.context('../packages/databyss-ui', true, /.stories.js$/),
  require.context('../packages/databyss-login', true, /.stories.js$/),
  require.context('../packages/databyss-notes', true, /.stories.js$/),
]

function loadStories() {
  reqs.map(req => req.keys().forEach(filename => req(filename)))
}

configure(loadStories, module)
