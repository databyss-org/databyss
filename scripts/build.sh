set -e # fail immediately
set -x # echo every command
set -o pipefail # fail immediately in pipeline

cleanup() {
  if [ ! -z $CLEANUP_SOURCE_FILES ] || [ ! -z $HEROKU_APP_NAME ]
  then
    rm -rf node_modules
    rm -rf packages
  fi
}

# if the NPM_DEPLOY_TARGET env var is STYLEGUIDE, build the styleguide
# otherwise, run build.js (from create-react-app)
if [ $NPM_DEPLOY_TARGET == STYLEGUIDE ]
then
  npm run styleguide:build
  cleanup
elif [ $NPM_DEPLOY_TARGET == DEMO ]
then
  npm run storybook:build
  cleanup
elif [ $NPM_DEPLOY_TARGET == NOTES_APP ]
then
  ENV_PREFIX=REACT_APP_ NPM_BUILD_TARGET=NOTES_APP node scripts/build.js
  cleanup
elif [ $NPM_DEPLOY_TARGET == API_SERVER ]
then
  ENV_PREFIX=API_ NPM_BUILD_TARGET=API_SERVER BABEL_ENV=production webpack --config packages/databyss-api/webpack.config.js --mode=production
  cleanup
else
  echo 'ERROR: NO TARGETS FOUND'
  exit 1
fi

# NOTE: create-react-app-inner-buildpack only exposes env vars prefixed with
#  "NODE_", "NPM_", and "REACT_APP_"
