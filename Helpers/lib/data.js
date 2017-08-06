/**
 * Extend array primitive to support selection of a member item at random
 */
Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)];
}

/**
 * Extend array primitive to support filtering for unique values - no dupes
 */
function uniques(value, index, self) {

    return self.indexOf(value) === index;
}

Array.prototype.unique = function() {

    return this.filter(uniques);
}

/**
 * Extend object primitive to support selection of a member key at random
 */
Object.prototype.random = function() {
    var keys = Object.keys(this);
    var selected = Math.floor(Math.random() * keys.length);
    return this[selected];
}

/**
 * Extend string primitive to support selection of non-article "keywords" contained in string
 * Ignores words less than 6 characters in length
 * Explicitly excludes some helper words that are 6 characters or longer
 *
 * Used by Conviviality's hashtagify method
 */
String.prototype.getKeywords = function() {
    var articles = ["before", "because", "things", "around", "should", "nearly"];
    var keywords = [];
    var tokens = this.split(/\s+/gi);
    return tokens.filter(function(token) {
        if (articles.indexOf(token) == -1 && token.length >= 6) return true;
    });
}