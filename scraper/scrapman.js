/**
 * Created by ev on 1/27/17.
 */

var scrapman = require("scrapman");
var cheerio = require("cheerio");

for (var i=0; i<5; i++){
    scrapman.load("http://www.nytimes.com", function(html){
        var $ = cheerio.load(html);
        var links = [];
        $('a').each(function(element, index){
            links.push($(this).attr('href'));
        });
        console.log(links.length);
    });
}

