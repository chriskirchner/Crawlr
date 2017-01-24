/**
 * Created by ev on 1/22/17.
 */

//https://www.digitalocean.com/community/tutorials/how-to-use-node-js-request-and-cheerio-to-set-up-simple-web-scraping

var request = require("request");
var cheerio = require("cheerio");

start_url = "https://www.nytimes.com/";
options = "";
var new_node_queue = [];
var visited_nodes = [];


//need to implement keyword
var first_node = {
    url: start_url,
    parent: null
};
new_node_queue.push(first_node);

//start bfs loop
while (new_node_queue.length > 0){
    //use shift to remove last element in queue
    var node = new_node_queue.shift();

    //see if node has already been visited
    var is_visited_node = visited_nodes.filter(function(e){
        return e.url == node.url;
    });
    if (is_visited_node.length == 0){
        //assign current node as visited
        visited_nodes.push(node);

        var data = {};
        request(node.url, function(error, response, html){
            var new_nodes = [];
            if (!error && response.statusCode == 200){
                var $ = cheerio.load(html);
                data.html = $.html();
                $('a').each(function(index, element){
                    var link = $(this).attr("href");
                    //build new node with link
                    var new_node = {
                        url: link,
                        parent: node.url
                    };
                    //add new node to queue
                    new_nodes.push(new_node);
                });
                console.log(new_nodes.length);
            }
        });
    }
}




