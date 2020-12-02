import { Users, Login } from '@databyss-org/data/serverdbs'
import path from 'path'
const fs = require('fs')

// import tv4 fro./dj4min'
// // import tv4 from 'tv4'

// var output = fs.readFileSync('./tv4.min.js')

// console.log(output)

// function _validate(this: any, newDoc: any) {
//   if (newDoc._deleted) return

//   // eslint-disable-next-line import/no-unresolved
//   const tv4 = require('libs/tv4')
//   if (!tv4.validate(newDoc, this.schema.users)) {
//     // eslint-disable-next-line no-throw-literal
//     throw { forbidden: `${tv4.error.message} -> ${tv4.error.dataPath}` }
//   }
// }

// function validate_doc_update(newDoc) {
//   if (newDoc['_deleted']) return

//   var tv4 = require('libs/tv4')

//   if (!tv4.validate(newDoc, this.schema)) {
//     throw { forbidden: tv4.error.message + ' -> ' + tv4.error.dataPath }
//   }
// }
export const updateAuthValidationDocs = async () => {
  const _dd = {
    _id: '_design/schema_validation',
    // libs: { tv4: require('./tv4.min').functionAsString },
    validate_doc_update: `function(newDoc) {
      if (newDoc['_deleted']) return;
      var tv4 = require('libs/tv4');


      if (!tv4.validate(newDoc, this.schema)) {
        throw({forbidden: tv4.error.message + ' -> ' + tv4.error.dataPath});
      }
    }`,
    libs: {
      tv4: fs.readFileSync(path.join(__dirname, './tv4.js')).toString(),
    },
    schema: {
      title: 'Blog',
      description: 'A document containing a single blog post.',
      type: 'object',
      required: ['title', 'body'],
      properties: {
        _id: {
          type: 'string',
        },
        _rev: {
          type: 'string',
        },
        title: {
          type: 'string',
        },
        body: {
          type: 'string',
        },
      },
    },
  }

  await Users.upsert(_dd._id, () => _dd)
}
