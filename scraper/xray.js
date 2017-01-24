/**
 * Created by ev on 1/22/17.
 */
var phantom = require('phantomjs');
var Xray = require('x-ray');

var x = Xray()
    .driver(phantom());

x('http://google.com', 'title')(function(err, str) {
    if (err) return done(err);
    assert.equal('Google', str);
    done();
})