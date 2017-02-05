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


//set size of viewport
var width = 960,
	height = 500;

//setup edge and node lists
var nodes = [],
	links = [];

//setup variables
var simulation, svg, g, linkGroup, nodeGroup;

//setup viewport with width and height
svg = d3.select('section')
	.append('svg')
	.attr('width', width)
	.attr('height', height);

//setup groups
g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
linkGroup = g.append("g");
nodeGroup = g.append("g");



function addNode(node, nodes, group){
	nodes.push(node);
	group
		.append('circle')
		.attr("r", 10)
		.attr('class', 'node')
		.attr('fill', 'white')
		.datum(node)
		.call(
			d3.drag()
				.on("start", startDrag)
				.on("drag", drag)
				.on("end", endDrag)
		);
}

//https://roshansanthosh.wordpress.com/2016/09/25/forces-in-d3-js-v4/
function startDrag(d)
{
	simulation.restart();
	simulation.alpha(1.0);
	d.fx = d.x;
	d.fy = d.y;
}

function drag(d)
{
	d.fx = d3.event.x;
	d.fy = d3.event.y;
}

function endDrag(d)
{
	d.fx = null;
	d.fy = null;
	simulation.alphaTarget(0.1);
}

function addLink(link_start, link_end, links, group){
	links.push({source: link_start, target: link_end});
	group
		.append('line')
		.attr('class', 'link')
		.attr('stroke', 'white')
		.attr('stroke-width', 1)
		.datum({source: link_start, target: link_end});
}

// function setupGFX(start){
// 	addNode(start, nodes, nodeGroup);
// 	addLink(start, start, links, linkGroup);
//
// 	//fix root node to center
// 	nodes[0].fx = 0;
// 	nodes[0].fy = 0;
// }

//setup force layout template
simulation = d3.forceSimulation(nodes)
	.force("charge", d3.forceManyBody().strength(-1))
	.force("link", d3.forceLink().id(function(d) { return d.url; }).distance(100))
	// .force("x", d3.forceX(width / 2))
	// .force("y", d3.forceY(height / 2))
	.on("tick", ticked);

function findParent(parent, links){
	return links.filter(function(e){
		if (e.url == parent.url){
			return e;
		}
	})[0]
}


//inspired by - https://gist.github.com/mbostock/1095795
function updateGFX(node){

	addNode(node, nodes, nodeGroup);
	if (node.parent == null){
		//fix root node
		nodes[0].fx = 0;
		nodes[0].fy = 0;
		node.parent = node;
	}
	var parent = findParent(node.parent, nodes);

	addLink(parent, node, links, linkGroup);


	simulation.nodes(nodes);
	simulation.force("link").links(links);
	simulation.alpha(1).restart();
	// console.log(links.toString());
	// console.log(nodes);
}

function ticked(){
	// if (nodes.length > 0){
	// 	nodes[0].x = 0;
	// 	nodes[0].y = 0;
	// }
	nodeGroup
		.selectAll(".node")
		.attr("cx", function(d) {return d.x;})
		.attr("cy", function(d) {return d.y;});

	linkGroup
		.selectAll(".link")
		.attr("x1", function(d) {return d.source.x;})
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
		io = io.connect({
			reconnection: false
		});

		var user_input = {};
		user_input.url = $('#url').val();
		user_input.level = 0;
		user_input.parent = null;
		// setupGFX(user_input);

		io.emit('reap urls', user_input);
		io.on('node send', function(node){
			updateGFX(node);
		});
		io.on('disconnect', function(){
			console.log('server disconnected');
		});
	});
});

