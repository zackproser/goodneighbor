var
  path = require('path'),
  bodyParser = require('body-parser'),
  express = require('express'),
  hbs = require('express-hbs'),
  app = express(),
  MongoClient = require('mongodb').MongoClient,
  logger = require('log4js').getLogger('grand-central-station'),
  fs = require('fs'),
  path = require('path'),
  ip = require('ip'),
  Helpers = require('../Helpers'),
  auth = require('http-auth'),
  request = require('request'),
  ClericModule = require('./lib/Cleric'),
  Rollbar = require('rollbar'),
  os = require('os')
;
/**
 * Global app handle
 */
global.app = app

var rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  handleUncaughtExceptions: (os.hostname() === process.env.DEVELOPMENT_MACHINE_HOSTNAME) ? false : true,
  handleUnhandledRejections: (os.hostname() === process.env.DEVELOPMENT_MACHINE_HOSTNAME) ? false : true
})

//Run sanity check on environment variables
Helpers.Validation.startupCheck('grand-central-station')

//Configure basic auth
var basic = auth.basic({
    realm: 'Admin'
}, (username, password, callback) => {
    callback(username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD)
})

var authMiddleware = auth.connect(basic)

global.authMiddleware = authMiddleware

global.Cleric = new ClericModule()

//Configure port that this manager app should listen on
app.set('port', process.env.GRAND_CENTRAL_STATION_PORT)

app.set('gcs_api_root', process.env.GCS_API_ROOT)

app.set('views', path.join(__dirname, 'build/views'))
app.set('view engine', 'hbs')
    //Set static path to build folder
app.use(express.static(__dirname + '/build'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//Save handle to logger
app.set('logger', logger)

let connect = () => {
  MongoClient.connect('mongodb://goodneighbor-db/hivemind', (err, db) => {
    if (err) {
        app.get('logger').error(`GCS Error connecting to mongodb: ${err}`)
        process.exit(1)
    }

    app.set('db', db)
    app.set('hivemind', db.collection('hivemind'))
    app.set('avatars', db.collection('avatars'))

    app.get('avatars').ensureIndex({ "name": 1 }, { unique: true, dropDups: true }, (err, doc) => {
        if (err) {
            console.error(err)
        }
        app.get('logger').info('Set unique index on avatars collection name field')
    })

    app.get('hivemind').ensureIndex({ "name": 1 }, { unique: true, dropDups: true }, (err, doc) => {
        if (err) {
            console.error(err)
        }
        app.get('logger').info('Set unique index on hivemind collection name field')
    })
  })
}

setTimeout(connect, 8000)

//Enable CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, authorization, Accept")
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    next()
})

//Allow OPTIONS pre-flight requests to work
app.all('*', (req, res, next) => {
    if (req.method === 'OPTIONS') {
        var headers = {}
        headers["Access-Control-Allow-Origin"] = "*"
        headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Authorization, Accept"
        headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, PUT, DELETE"
        res.writeHead(200, headers)
        res.end()
    } else {
        next()
    }
})

//Serve admin client static assets
app.use(express.static(path.join(__dirname, 'dist')))

/**
 * Load all routes
 */
app.use('/', require('./routes/index'))

//Listen for HTTP requests
app.listen(app.get('port'), () => {
    app.get('logger').info(`Grand central station app listening on ${app.get('port')}`)
})

setInterval(() => { //After the burning there is only the burning and after the burning there is only te burning
    Cleric.recoverFallenAvatars((err) => {
        if (err) app.get('logger').error(`auto recovering fallen avatars error: ${error}`)
    })
}, process.env.FALLEN_AVATAR_RECOVERY_INTERVAL_MILLISECONDS)