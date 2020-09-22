set -e # fail immediately
set -x # echo every command
set -o pipefail # fail immediately in pipeline

if [ $NPM_DEPLOY_TARGET == API_SERVER ]
then
  NPM_BUILD_TARGET=API_SERVER node build/api/app.js
elif [ $NPM_DEPLOY_TARGET == PDF_API ]
then
  NPM_BUILD_TARGET=PDF_API node build/pdf-api/app.js
elif [ $NPM_DEPLOY_TARGET == NOTES_MOBILE ]
then
  NPM_BUILD_TARGET=NOTES_MOBILE node build/notes-mobile/app.js
else
  echo 'ERROR: NO VALID TARGETS FOUND'
  exit 1
fi

# NOTE: create-react-app-inner-buildpack only exposes env vars prefixed with
#  "NODE_", "NPM_", and "REACT_APP_"
