/**
 * Created by ev on 1/22/17.
 */

var Nightmare = require('nightmare');
var nm = Nightmare({
    show: false,
    'web-preferences': {'web-security': false}
});

var nightmare = function(io) {
    return nm
        .goto('https://www.google.com/')
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
            io.emit('node', result);
        })
        .then(function(){
            console.log('done reaping!');
        })
        .catch(function (error) {
            console.error('Search failed:', error);
        });
};

module.exports = nightmare;
