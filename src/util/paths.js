const path = require('path')
const fs = require('fs')


const RESOURCE_DIR = path.join(__dirname, '..', 'resources')


function getResource(resourcePath) {
  let resolved = path.join(RESOURCE_DIR, resourcePath)
  fs.accessSync(resolved, fs.F_OK, function(err) {
    if (err) {
      throw new Error(`No resource: ${resolved}`)
    }
  });
  return resolved
}


module.exports = {
  getResource: getResource
}