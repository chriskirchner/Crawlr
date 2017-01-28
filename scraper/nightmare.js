/**
 * Created by ev on 1/22/17.
 */

var Nightmare = require('nightmare');


var nightmare = function(io, socket, user_input) {
	console.log('socket: reaping...');
	var nm = Nightmare({
		show: false,
		'web-preferences': {'web-security': false}
	});
	return nm
        .goto(user_input.url)
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
            for (var i=0; i<result.length; i++){
                io.emit('node', result[i]);
            }
        })
        .then(function(){
	        socket.disconnect();
            console.log('done reaping!');
        })
        .catch(function (error) {
            console.error('Search failed:', error);
        });
};

module.exports = nightmare;
