const fs = require('fs')
const mongoose = require('mongoose')
const Author = require('./models/Author')
// const Entry = require('../../models/Entry')

let rawdata = fs.readFileSync('entries_old.json')
let entries = JSON.parse(rawdata)
//const slicedEntry = entries.slice(1, 3)
//console.log(slicedEntry[0])

let newEntry = entries.map(e => {
  let obj = {}
  obj._id = e._id
  obj.authorId = e.source.author
  obj.sourceId = e.source.id
  obj.author = []
  obj.source = ''
  obj.linkedContent = e.linkedContent
  obj.entry = e.content
  obj.pageFrom = e.locations.low
  obj.pageTo = e.locations.high
  obj.default = true
  obj.user = ''
  obj.index = 0
  obj.document = e.content
  return obj
})

fs.writeFileSync('entries.json', JSON.stringify(newEntry))

console.log(newEntry[0])

// let rawdata = fs.readFileSync('sources_old.json')
// let sources = JSON.parse(rawdata)

/*
let rawdata = fs.readFileSync('authors_old.json')
let authors = JSON.parse(rawdata)

let newAuthors = authors.map(a => {
  let obj = a
  obj.entries = []
  obj.sources = []
  obj.default = true
  obj.user = ''
  return a
})
console.log(newAuthors[0])

fs.writeFileSync('author.json', JSON.stringify(newAuthors))

*/
/*
let newSources = sources.map(a => {
  let obj = {}
  obj._id = a._id
  obj.resource = a.title
  obj.user = ''
  obj.default = true
  obj.citations = a.citations
  obj.abbreviation = a.id
  obj.authors = []
  obj.author = a.author
  //let author = await Author.findOne({ _id: _id })

  return obj
})
*/

// Author.find({ _id: '5b0efb34889a46141f199136' }).then(e => console.log(e))

//fs.writeFileSync('source.json', JSON.stringify(newSources))
/*
const findAuthor = async id => {
  const author = await Author.find()
}
*/
//findAuthor(newSources[0].author)

//Author.findOne().then(a => console.log(a))

/*
console.log(newSources[0].author)
Author.findOne({ id: newSources[0].author })
  .then(e => console.log(e))
  .catch(function(error) {
    console.log(error)
  })
  */
//console.log(a.author)
/*
//console.log(authors[0])

let newAuthors = authors.map(a => {
  let obj = a
  obj.entries = []
  obj.sources = []
  obj.user = 'default'
  return a
})
console.log(newAuthors[0])



Author.findOne().then(a => console.log(a))
*/

//fs.writeFileSync('author.json', JSON.stringify(newAuthors))

// console.log(motifs[0])

/*
let newMotifs = motifs.map(m => {
  let obj = m
  obj.parsedWords = m.name.split(' ').map(w => ({
    word: w,
    selected: true,
  }))
  return m
})
console.log(newMotifs[0])
console.log(motifs[0])
*/
