/* eslint-disable */
function(newDoc) {
    if (newDoc['_deleted']) return;
    var tv4 = require('libs/tv4');


    if (!tv4.validate(newDoc, this.schema,false,true)) {
      throw({forbidden: tv4.error.message + ' -> ' + tv4.error.dataPath + '//' + 'oldDoc: ' + JSON.stringify(newDoc._revisions)});
    }
  }