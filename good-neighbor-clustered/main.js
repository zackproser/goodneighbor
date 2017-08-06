/**
 * Main entry point
 *
 * @author Zack Proser
 */

var
//the settings string passed by hypervisor
    settings_string = process.argv[2],
    app = require('express')(),
    EventEmitter = require('events').EventEmitter,
    Helpers = require('../Helpers'),
    Manners = require('./lib/Manners'),
    MongoClient = require('mongodb').MongoClient,
    log4js = require('log4js'),
    request = require('request'),
    config_update_url,
    os = require('os'),
    Rollbar = require('rollbar')
;

//If we're running on our development machine, rollbar should handle uncaught exceptions
var rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  handleUncaughtExceptions: (os.hostname() === process.env.DEVELOPMENT_MACHINE_HOSTNAME) ? false : true,
  handleUnhandledRejections: (os.hostname() === process.env.DEVELOPMENT_MACHINE_HOSTNAME) ? false : true
})

//Run sanity check on environment variables, ensuring all critical vars are set
//This will bail out if any of them are missing
Helpers.Validation.startupCheck('goodneighbor')

/**
 * Global app handle
 */
global.app = app

//Startup - ensure settings argument is valid
try {
    var configArgument = JSON.parse(settings_string)

} catch (e) {
    console.error('main.js: error parsing settings_string argument as JSON')
    process.exit(1)
}

if (!Helpers.Validation.isValidConfig(configArgument)) {
    //No valid config = Seppuku
    console.error('GNC startup - settings_string invalid - aborting...')
    process.exit(1)
}

var initial_settings = JSON.parse(settings_string)
var name = initial_settings.bot.name

var configPollOptions = {
    url: `${process.env.CONFIG_UPDATE_URL}${initial_settings.bot.name}`,
    headers: {
        'Authorization': 'Basic ' + new Buffer(process.env.ADMIN_USERNAME + ':' + process.env.ADMIN_PASSWORD).toString('base64')
    }
}

handleConfigPollResponse = (err, response, body) => {
    if (err) console.error(`GNC main.js error polling GCS for config update: ${err}`)
    if (!err && response.statusCode == 200 && typeof body != "undefined") {
        try {
            var parsedBody = JSON.parse(body)
            var configUpdate = (typeof parsedBody[0].config === "object") ? parsedBody[0].config : {}
        } catch (e) {
            console.error('GNC error parsing retrieved config')
        }
        if (Helpers.Validation.isValidConfig(configUpdate)) {
            app.set('settings', configUpdate);
            console.log(`avatar ${app.get('settings').bot.name} retrieving latest config...`)
        } else {
            console.error(`GNC main.js found invalid config on update: ${configUpdate}`)
        }
    } else {
        console.error(`${name} GNC main.js received malformed response from GCS: ${body}`)
    }
};

var retrieveLatestConfig = () => {
    request(configPollOptions, handleConfigPollResponse);
}

/**
 * Save Global Handle to Settings Object
 */
app.set('settings', JSON.parse(settings_string));

retrieveLatestConfig();

//Poll for settings updates every 5 minutes
setInterval(retrieveLatestConfig, process.env.CONFIG_POLL_INTERVAL_MILLISECONDS);

/**
 * Listen for and accept config updates from Hypervisor
 */
process.on('message', function(config) {
    app.get('logger').info('Avatar: ' + app.get('settings').bot.name + ' received config update from Hypervisor');

    //If config passes validation, update it
    if (Helpers.Validation.isValidConfig(config)) {

        app.set('settings', JSON.parse(config));

    } else {

        app.get('logger').error('Avatar: ' + app.get('settings').bot.name + ' received INVALID config update - REJECTING');

    }
});

/**
 * Create logger based on avatar name
 */
var logger = log4js.getLogger(app.get('settings').bot.name);

/**
 * Save handle to app.get('logger')
 */
app.set('logger', logger);

//Turn off all logging - Unless DEBUG flag is passed on startup
if (process.env.DEBUG && process.env.DEBUG == "true") {
    app.get('logger').setLevel('DEBUG');
} else {
    app.get('logger').setLevel('OFF');
}

/**
 * Create main pubsub channel that modules will use
 * To communicate events
 */
var channel = new EventEmitter();

/**
 * Instantiate modules
 * Begin main app process
 */
function boot() {

    var
        Ambition = require('./lib/Ambition'),
        Conviviality = require('./lib/Conviviality'),
        Pedantry = require('./lib/Pedantry');
    //Twitter REST interaction, conversation and advertising module
    var Conviviality = new Conviviality();
    //Time manager & action scheduling module
    var Ambition = new Ambition();
    //Article scraping and storing module
    var Pedantry = new Pedantry();
}

/**
 * Save global handle to channel
 */
app.set('channel', channel);

/**
 * Determine the Mongo Connection URI based on settings
 * The mongo collection is named after the bot
 */
let mongoConnectUri = `mongodb://${app.get('settings').mongo.host}:${app.get('settings').mongo.port}/${app.get('settings').bot.name}`
/**
 * Connect to Mongo, open collections and store them in app-level variables
 */
MongoClient.connect(mongoConnectUri, (err, db) => {
    app.get('logger').info('Checking initial collection');

    if (err) {
      app.get('logger').error(err)
    }

    //Save handle to the database
    app.set('db', db)

    app.set('advertised_items', db.collection('advertised_items'));
    app.set('tweet_collection', db.collection('pulled_articles'));
    app.set('thanked_users', db.collection('thanked_users'));
    app.set('welcomed_user_tweet_ids', db.collection('welcomed_user_tweet_ids'));

    /**
     * Set unique indexes on mongo collections
     *
     * thanked_users collection requires a unique index on Twitter username
     * welcomed_users_tweed_ids collection requires a unique index on user ID
     * advertised_items collection requires a unique index on ASIN
     * pulled_articles / tweet_collection collection requires a unique index on original_link
     */

    app.get('thanked_users').ensureIndex({ "username": 1 }, { unique: true, dropDups: true }, (err, doc) => {
        if (err) app.get('logger').error(err)
        app.get('logger').info('Main set unique index on thanked_users username field')
    })

    app.get('welcomed_user_tweet_ids').ensureIndex({ "user_id": 1 }, { unique: true, dropDups: true }, (err, doc) => {
        if (err) app.get('logger').error(err)
        app.get('logger').info('Main set unique index on welcomed_user_tweet_ids user_id field')
    })

    app.get('advertised_items').ensureIndex({ "asin": 1 }, { unique: true, dropDups: true }, (err, doc) => {
        if (err) app.get('logger').error(err)
        app.get('logger').info('Main set unique index on advertised_items ASIN field')
    })

    app.get('tweet_collection').ensureIndex({ "original_link": 1 }, { unique: true, dropDups: true }, (err, doc) => {
        if (err) app.get('logger').error(err)
        app.get('logger').info('Main set unique index on pulled_articles original_link field')
    })

    //"I never saved anything for the swim back."
    boot()
})