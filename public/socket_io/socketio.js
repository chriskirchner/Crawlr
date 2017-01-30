/**
 * Created by ev on 1/24/17.
 */


// (function(t,n){
//     if ("object"==typeof exports && "undefined" != typeof module) {
// 	    n(exports)
//     }
//     else {
// 	    if ("function"==typeof define && define.amd) {
// 		    define(["exports"], n)
// 	    }
// 	    else {
// 		    n(t.d3=t.d3||{})
// 	    }
//     }
// })
// (this,
//     function(t){
//         "use strict";
//     }
//     function n(t){
//         return function(n,e){
//             return Ms(t(n),e)
//         }
//     }
// );

//inspired by - http://stackoverflow.com/questions/11400241/updating-links-on-a-force-directed-graph-from-dynamic-json-data
//inspired by - http://jsfiddle.net/2Dvws/

// function getParent(root, id){
// 	var children = root.children;
// 	if (children){
// 		for (var key in children){
// 			if(children[k].id == id){
// 				return children[k]
// 			}
// 			else if (children[k].children){
// 				return getObj(children[k], id);
// 			}
// 		}
// 	}
// }
//
// function addNode(nodes, node){
// 	var parent = getParent(nodes[0], node.parent);
// 	parent.push(node);
// }

function setupGFX(){

}
//set size of viewport
var width = 960,
	height = 500;

//setup viewport with width and height
var svg = d3.select('section')
	.append('svg')
	.attr('width', width)
	.attr('height', height);

//setup edge and node lists
var nodes = [],
	links = [];

//setup force layout template
var simulation = d3.forceSimulation(nodes)
	.force("charge", d3.forceManyBody().strength(-1000))
	.force("link", d3.forceLink().distance(200))
	.force("x", d3.forceX())
	.force("y", d3.forceY(links))
	.alphaTarget(1)
	.on("tick", ticked);

//setup edge and nodes
var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
	domLinks = g.append("g").attr("stroke", "#000").attr("stroke-width", 1.5).selectAll(".link"),
	domNodes = g.append("g").attr("stroke", "#fff").attr("stroke-width", 1.5).selectAll(".node");


//inspired by - https://gist.github.com/mbostock/1095795
function updateGFX(parent, site){


	links.push({source: parent, target: site});
	nodes.push(site);

	console.log(nodes);
	console.log(links);

	// domNodes
	// 	.datum(site)
	// 	.enter()
	// 	.append("circle")
	// 	.attr("r", 10)
	// 	.attr('class', '.node')
	// 	.attr('fill', 'white')
	// 	.merge(domNodes);
	//
	// domLinks
	// 	.datum(parent +"-"+ site)
	// 	.enter()
	// 	.append("line")
	// 	.merge(domLinks);


	domNodes = domNodes.data(nodes, function(d) { return d.id;});
	domNodes.exit().remove();
	domNodes = domNodes.enter().append("circle").attr("fill", "white").attr("r", 8).merge(domNodes);
	// Apply the general update pattern to the links.
	if (parent == null){
		domLinks = domLinks.data(links, function(d) { return d.source.id + "-" + d.target.id; });
	}
	else {
		domLinks = domLinks.data(links, function(d) { return "null" + "-" + d.target.id; });
	}
	domLinks.exit().remove();
	domLinks = domLinks.enter().append("line").merge(domLinks);

	simulation.nodes(nodes);
	simulation.force("link").links(links);
	simulation.alpha(1).restart();
}

function ticked(){
	if (nodes.length > 0){
		nodes[0].x = 0;
		nodes[0].y = 0;
	}
	domNodes.attr("cx", function(d) {return d.x;})
		.attr("cy", function(d) {return d.y;});

	domLinks.attr("x1", function(d) {return d.source.x;})
		.attr("y1", function(d) {return d.source.y;})
		.attr("x2", function(d) {return d.target.x;})
		.attr("y2", function(d) {return d.target.y;});
}


//use socket io to update GFX real time BABY!
var io;
$(document).ready(function(){
	$('#crawl-form').on('submit', function(e){
		e.preventDefault();
		console.log('socketio: connecting to server');
		io = io.connect();
		var user_input = {};
		user_input.id = $('#url').val();
		user_input.url = $('#url').val();
		user_input.levels = $('#levels').val();
		user_input.keyword = $('#search_term').val();
		updateGFX(user_input, user_input);
		io.emit('reap urls', user_input);
		io.on('node', function(node){
			updateGFX(node[0], node[1]);
		});
		io.on('disconnect', function(){
			console.log('server disconnected');
		});
	});
});

