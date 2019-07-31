set -e # fail immediately
set -x # echo every command
set -o pipefail # fail immediately in pipeline

# if the NPM_DEPLOY_TARGET env var is STYLEGUIDE, build the styleguide
# otherwise, run build.js (from create-react-app)
if [ $NPM_DEPLOY_TARGET == API_SERVER ]
then
  NPM_BUILD_TARGET=API_SERVER node build/api/server.js
else
  echo 'ERROR: NO VALID TARGETS FOUND'
  exit 1
fi

# NOTE: create-react-app-inner-buildpack only exposes env vars prefixed with
#  "NODE_", "NPM_", and "REACT_APP_"
