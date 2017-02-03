/**
 * Created by ev on 2/1/17.
 */

var Nightmare = require('nightmare');

var nightmare = function(io) {
	var nm = Nightmare({
		show: false,
		'web-preferences': {'web-security': false}
	});

	return nm
		.goto('https://www.nytimes.com/')
		.evaluate(function () {
			var links = document.querySelectorAll('a');
			var hrefs = [];
			for (var i=0; i<links.length; i++){
				hrefs.push(links[i].href);
			}
			return hrefs;
		})
		.end()
		.then(function (result) {
			console.log(result.length);
			//io.emit('node', result);
		})
		.catch(function (error) {
			console.error('Search failed:', error);
		});
};

const amount = 20;

console.log(`NIGHTMARE > Scrapping ${amount} times`);

for (var i=0; i<amount; i++){
	nightmare();
}