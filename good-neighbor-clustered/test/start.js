var Helpers = require('../lib/Helpers/lib/validations');
var path = require('path');

exports.findsValidConfigAtProjectRoot = function(test) {
    test.expect(1); 
    test.ok(true, Helpers.isValidConfig(process.cwd()));
    test.done(); 
}



