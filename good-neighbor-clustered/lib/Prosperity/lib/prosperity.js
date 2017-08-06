var
    util = require('util')
    , OperationHelper = require('apac').OperationHelper
;

/**
 * Module tasked with generating and storing affiliate linked items
 * From Amazon Associates API for use by bot in advertising tweets
 * @class
 *
 * @author Zack Proser
 *
 * @param {object} app.get('settings') - Settings object based on config.json
 * @param {object} channel - Main EventEmitter channel shared by modules for PubSub
 */
class Prosperity {
    constructor() {
        this.init()
    }

    /**
     * Setup connection to Amazon Associates API
     *
     * @param {object} app.get('settings') - Settings object based on config.json
     * @param {object} channel - Main EventEmitter channel shared by modules for PubSub
     */
    init() {

        this.opHelper = new OperationHelper({
            awsId: app.get('settings').aws.awsId.trim(),
            awsSecret: app.get('settings').aws.awsSecret.trim(),
            assocId: app.get('settings').aws.assocId.trim()
        });

        /**
         * When TimeManager dispatches the research command, hit it
         */
        app.get('channel').on('commandAdvertisingResearch', () => {
            this.researchProducts();
        })

        /**
         * Begin researching products
         */
        this.researchProducts();

    }

    /**
     * Research Amazon products and store new items in Mongo advertising collection
     */
    researchProducts() {
        let product_keyword = app.get('settings').aws.product_keywords.random();
        this.searchProducts(app.get('settings').aws.searchIndex, product_keyword, (err, results) => {
            if (err) app.get('logger').error(err);
            results.forEach((doc) => {
                app.get('advertised_items').save(doc, (err, doc) => {
                    if (err) {
                        /**
                         * Just log as info any insert failed due to duplicate key errors
                         */
                        if (err.code == 11000) {

                            app.get('logger').info('Prosperity: duplicate stored advertisement found - record not written');
                        } else {

                            app.get('logger').error(err);
                        }
                    }
                    app.get('logger').info('Prosperity researchProducts saved research response');
                })
            })
        })
    }

    /**
     * Callback for searching products via Amazon Associates API
     *
     * @callback searchProductsCallback
     * @param {array} result_array - Array containing Amazon Product objects returned by API
     */


    /**
     * Query Amazon Associates API for products based on arguments
     *
     * @param  {string} searchIndex - The Amazon Associates 'Index' to search on. Ex: "Books", "All", or "Accessories"
     * @param  {array} keywords - Array of keyword strings to pass to Amazon Associates API
     * @param  {searchProductsCallback} callback - Function to return Amazon item objects
     */
    searchProducts(searchIndex, keywords, callback) {
        app.get('logger').info('searchProducts running..' + searchIndex + ' ' + keywords);
        this.opHelper.execute('ItemSearch', {
            'SearchIndex': searchIndex,
            'Keywords': keywords,
            'ResponseGroup': 'ItemAttributes, Offers'
        }, (err, results) => {
            if (err) {
                app.get('logger').error(err);
                callback(err);
            }
            if (results.ItemSearchResponse.Items && results.ItemSearchResponse.Items.length > 0) {
              let items = results.ItemSearchResponse.Items[0].Item;
            } else {
              let items = []
            }
            let result_array = []
            if (typeof items != "undefined") {
                if (items.length > 1) {
                    items.forEach((item) => {
                        let return_object = {};
                        return_object.asin = typeof item.ASIN != "undefined" ? item.ASIN : null;
                        return_object.title = typeof item.ItemAttributes[0].Title != "undefined" ? item.ItemAttributes[0].Title : null;
                        return_object.link = typeof item.DetailPageURL != "undefined" ? item.DetailPageURL : null;
                        return_object.tweeted = false;
                        result_array.push(return_object);
                    });
                    callback(null, result_array);
                } else {
                    callback('No items found');
                }
            }
        });
    }
}

module.exports = Prosperity;