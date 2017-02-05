/**
 * Created by ev on 1/27/17.
 */

var scrapman = require("scrapman");
var cheerio = require("cheerio");

scrapman.configure({
    maxConcurrentOperations: 5
});

function BFS(socket, node, max_level){
	if ((node.level <= max_level) && socket.connected){

		scrapman.load(node.url, function(html){
            socket.emit('node send', node);

            console.log(node);
            console.log(socket.connected);
            var $ = cheerio.load(html);
            var links = [];
            $('a').each(function(element, index){
                links.push($(this).attr('href'));
            });

            next_level = node.level + 1;
            node.parent = null;
            for (var i=0; i<links.length; i++){

                var new_node = {};
                new_node.url = links[i];
                new_node.parent = node;
                new_node.level = next_level;
                BFS(socket, new_node, max_level);
            }
		});
	}
}



module.exports = BFS;
