/**
 *  Determines if the config string passed to an avatar is valid
 *
 *  Used when deciding whether or not an avatar should load a passed
 *  configuration string into memory as its new settings
 */
class validator {

    /**
     * Determines whether a valid config file is present and properly formed
     *
     * Config should always be of Type Object when loaded into app.set('settings', config)
     *
     * Config will be of Type String when passed as an argument to main.js to start an avatar
     *
     * @param  {Object} json - The settings object to validate
     * @return {boolean} isValidConfig - Whether or not a valid config is present
     */
    isValidConfig(json) {
        if (typeof json != "object") {
            return false;
        }
        try {
            this.validateJson(json);
        } catch (validationError) {

            return false;
        }
        return true;
    }

    /**
     * Determines whether json supplied by config file is properly formatted
     * @param  {object} json - The json object contained in the config.json file
     */
    validateJson(json) {
        let errors = [];

        /**
         * fields that contain arrays should be denoted as type: "object"
         */
        let fields = [{
            subobject: "bot",
            name: "name",
            type: "string"
        }, {
            subobject: "bitly",
            name: "user",
            type: "string"
        }, {
            subobject: "bitly",
            name: "key",
            type: "string"
        }, {
            subobject: "twitter",
            name: "tracking_name",
            type: "object"
        }, {
            subobject: "twitter",
            name: "consumer_key",
            type: "string"
        }, {
            subobject: "twitter",
            name: "consumer_secret",
            type: "string"
        }, {
            subobject: "twitter",
            name: "access_token",
            type: "string"
        }, {
            subobject: "twitter",
            name: "access_token_secret",
            type: "string"
        }, {
            subobject: "twitter",
            name: "target_hashtags",
            type: "object"
        }, {
            subobject: "twitter",
            name: "users_to_ignore",
            type: "object"
        }, {
            subobject: "twitter",
            name: "retweet_disqualifiers",
            type: "object"
        }, {
            subobject: "twitter",
            name: "retweet_thank_yous",
            type: "object"
        }, {
            subobject: "twitter",
            name: "youre_welcomes",
            type: "object"
        }, {
            subobject: "mongo",
            name: "host",
            type: "string"
        }, {
            subobject: "mongo",
            name: "port",
            type: "number"
        }, {
            subobject: "scraper",
            name: "feeds",
            type: "object"
        }, {
            subobject: "aws",
            name: "awsId",
            type: "string"
        }, {
            subobject: "aws",
            name: "awsSecret",
            type: "string"
        }, {
            subobject: "aws",
            name: "assocId",
            type: "string"
        }, {
            subobject: "aws",
            name: "searchIndex",
            type: "string"
        }, {
            subobject: "timers",
            name: "retweetTimer",
            type: "object"
        }, {
            subobject: "timers",
            name: "thankYouTimer",
            type: "object"
        }, {
            subobject: "timers",
            name: "checkThankYouTimer",
            type: "object"
        }, {
            subobject: "timers",
            name: "pruneInterval",
            type: "object"
        }, {
            subobject: "timers",
            name: "pruneInterval",
            type: "object"
        }, {
            subobject: "timers",
            name: "favoriteTimer",
            type: "object"
        }, {
            subobject: "timers",
            name: "scrapeInterval",
            type: "object"
        }, {
            subobject: "timers",
            name: "tweetInterval",
            type: "object"
        }, {
            subobject: "timers",
            name: "advertisementInterval",
            type: "object"
        }, {
            subobject: "timers",
            name: "retweetTimer",
            type: "object"
        }];

        fields.forEach((field) => {

            switch (field.type) {

                case "string":
                    var configField = json[field.subobject][field.name];
                    if (typeof configField !== "string") {
                        var typeError = 'Config.json Type Mismatch: ' + field.subobject + '.' + field.name + ' expected to be of type ' + field.type + ' but is of type ' + typeof json[field.name];
                        errors.push(typeError);
                    }
                    if (configField.length === 0) {
                        var emptyError = 'Config.json Missing Field: ' + field.name + ' from ' + field.subobject + ' settings';
                        errors.push(emptyError);
                    }
                    break;
                case "number":
                    var configField = json[field.subobject][field.name];
                    if (typeof configField !== "number") {
                        var typeError = 'Config.json Type Mismatch: ' + field.subobject + '.' + field.name + ' expected to be of type ' + field.type + ' but is of type ' + typeof json[field.name];
                        errors.push(typeError);
                    }
                    break;
                case "object":
                    var configField = json[field.subobject][field.name];
                    if (typeof configField !== "object") {
                        var typeError = 'Config.json Type Mismatch: ' + field.subobject + '.' + field.name + ' expected to be of type ' + field.type + ' but is of type ' + typeof json[field.name];
                        errors.push(typeError);
                    }
                    if (configField.length === 0) {
                        var emptyError = 'Config.json Missing Field: ' + field.name + ' from ' + field.subobject + ' settings';
                        errors.push(emptyError);
                    }
                    if (field.subobject === "timers") {
                        configField.min = parseInt(configField.min, 10)
                        configField.max = parseInt(configField.max, 10)
                        if (configField.min >= configField.max) {
                            var minRangeError = 'Config.json timer ' + field.name + 'min must be smaller than max'
                            errors.push(minRangeError)
                        }

                    }
                    break
            }

        })

        /**
         * If There Are No Errors Validating Config, Return Valid
         */
        if (errors.length === 0) {
            return true
        } else {
            throw new Error(errors)
        }
    }

    startupCheck(target) {

        let gn_required = [
            'CONFIG_UPDATE_URL', //URL to which avatars should 'phone home' for updates
            'CONFIG_POLL_INTERVAL_MILLISECONDS', //How often avatars should poll for config
            'AVATAR_CONFIG_API_KEY'
        ]

        let gcs_required = [
            'GCS_API_ROOT', //Where the grand central station api will live
            'CONFIG_POLL_INTERVAL_MILLISECONDS', //How often avatars should poll for config
            'FALLEN_AVATAR_RECOVERY_INTERVAL_MILLISECONDS',
            'GRAND_CENTRAL_STATION_PORT', //Port that GCS should bind to
            'CONFIG_UPDATE_URL',
            'AVATAR_CONFIG_API_KEY',
            'ADMIN_PASSWORD',
            'ADMIN_USERNAME'
        ]

        let checkArray = (target === 'grand-central-station' ? gcs_required : gn_required)

        checkArray.forEach((r) => {

            if (typeof process.env[r] === "undefined"
                || process.env[r] == null
                || process.env[r] == ''
            )
            {
                console.error(`EMERGENCY - missing required environment variable: ${r}`)
                process.exit(1)
            }
        })
    }
}

module.exports = validator;