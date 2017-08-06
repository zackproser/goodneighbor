var xhr = require('xhr')

export default class {

  static api (method, uri, body, cb) {
    console.log(`method = ${method} uri=${uri}`)
    console.dir(`http://localhost:3100${uri}`)
    xhr({
      method,
      useXDR: true,
      body,
      uri: `http://localhost:3100${uri}`,
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('goodneighbor' + ':' + 'qde786DGWZDSYDASYUDGzd2E7F6WE')
      }
    }, (err, res) => {
      console.dir(err)
      console.dir(res)
      if (err) {
        console.error(err)
        return cb(err)
      } else {
        return cb(res.statusCode, res)
      }
    })
  }
}
