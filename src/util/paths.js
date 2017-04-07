'use strict'


const path = require('path')
const fs = require('fs')

const RESOURCE_DIR = path.join(__dirname, '..', 'resources')


function getResource(name) {
  // Get a resource given a name (filename or folder), must exactly match

  let resolved = path.join(RESOURCE_DIR, name)
  fs.accessSync(resolved, fs.F_OK, function(err) {
    if (err) {
      throw new Error(`No resource: ${resolved}`)
    }
  });
  return resolved
}

function getResourceGlob(glob) {
  // Get a resource given a glob, doesn't need to exactly match

  let files = fs.readdirSync(RESOURCE_DIR)
  for (let f of files) {
    if (f.indexOf(glob) > -1) {
      return path.join(RESOURCE_DIR, f)
    }
  }

  throw new Error(`No resource contains glob: ${glob}`)
}


module.exports = {
  getResource: getResource,
  getResourceGlob: getResourceGlob
}
