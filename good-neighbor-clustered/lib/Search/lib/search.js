var
    OAuth2 = require('../../../lib/oauth').OAuth2,
    https = require('https'),
    http = require('http'),
    MannersModule = require('../../Manners'),
    Manners;

/**
 * Interacts with Twitter Search API
 */
class Search {
    constructor() {
        this.init()
    }

    init() {
        Manners = new MannersModule()
    }

    query(query, callback) {
        let oauth2 = new OAuth2(app.get('settings').twitter.consumer_key, app.get('settings').twitter.consumer_secret, 'https://api.twitter.com/', null, 'oauth2/token', null)
        oauth2.getOAuthAccessToken('', {
            'grant_type': 'client_credentials'
        }, (e, access_token) => {

            let options = {
                hostname: 'api.twitter.com',
                path: this.formatSearchUrl(query),
                headers: {
                    Authorization: 'Bearer ' + access_token
                }
            }

            https.get(options, (result) => {
                let buffer = ''
                result.setEncoding('utf8')
                result.on('data', (data) => {
                    buffer += data
                });
                result.on('end', () => {
                    let tweets = JSON.parse(buffer)
                    Manners.filterSearchResults(tweets.statuses, (err, tweets) => {
                        if (err) callback(err)
                        return callback(null, tweets)
                    })
                })
            })
        })
    }

    formatSearchUrl(query) {
        return '/1.1/search/tweets.json?q=%23' + encodeURIComponent(query) + '%20filter:safe%20filter:media&lang=en&result_type=popular';
    }
}

module.exports = Search;