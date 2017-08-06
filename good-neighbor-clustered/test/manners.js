var MannersModule = require('../lib/Manners/lib/manners.js'); 

exports.returnsLastRetweetedUser = function(test) {
	test.expect(1); 
	var Manners = new MannersModule();  
	test.equal(undefined, Manners.getLastRetweetedUser()); 
	test.done(); 
} 