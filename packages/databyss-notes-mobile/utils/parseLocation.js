import NavBarItems from '../constants/NavBarItems'
import SourcesMetadata from '../modules/Sources/SourcesMetadata'

const getItemByUrl = url => NavBarItems().find(i => i.url === url)

/**
 * @param {object} location Location provided by navigation context.
 * <pre>
 *   const navigationContext = useNavigationContext()
 *   const { location } = navigationContext
 * </pre>
 * Do not confuse with `window.location`.
 */
export const parseLocation = location => {
  const pathFragments = location.pathname.split('/')
  pathFragments.splice(0, 1)

  const response = {
    navDepth: pathFragments.length - 2, // first item is account
    accountId: pathFragments[0],
    breadCrumbs: [],
  }

  if (location.pathname.indexOf(SourcesMetadata.url) > -1) {
    // sources tab
    pathFragments.forEach((fragment, index) => {
      // ignoring first item, which is account id

      if (index === 1) {
        response.breadCrumbs.push({
          index: getItemByUrl(`/${fragment}`),
        })
      } else if (index === 2) {
        if (fragment === 'authors') {
          response.breadCrumbs.push({
            id: fragment,
          })

          const urlParams = new URLSearchParams(location.search)
          const firstName = urlParams.get('firstName')
          const lastName = urlParams.get('lastName')

          if (firstName || lastName) {
            response.breadCrumbs.push({
              author: { firstName, lastName },
            })
          }
        } else {
          response.breadCrumbs.push({
            id: fragment,
          })
        }
      }
    })
  } else {
    // other tabs
    pathFragments.forEach((fragment, index) => {
      // ignoring first item, which is account id

      if (index === 1) {
        response.breadCrumbs.push({
          index: getItemByUrl(`/${fragment}`),
        })
      } else if (index === 2) {
        response.breadCrumbs.push({
          id: fragment,
        })
      }
    })
  }

  return response
}
