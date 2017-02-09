/**
 * Created by ev on 1/24/17.
 */

//set size of viewport
var width = 960,
	height = 500;

//setup edge and node lists
var nodes = [],
	links = [];

//setup variables
var simulation, svg, g, linkGroup, nodeGroup;

var numTicks = 0;
var ticksToSkip = 0;

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d){
        return "<strong>URL:</strong> <span style='color:red'>" + d.url + "</span>"
    });

function setupGFX(){

    //setup viewport with width and height
    svg = d3.select('section')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
		.call(tip);

    //setup groups
    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    linkGroup = g.append("g");
    nodeGroup = g.append("g");

    //setup force layout template
    simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-10))
        .force("link", d3.forceLink().id(function(d) { return d.url; }).distance(90))
        .force("x", d3.forceX(0).strength(0.02))
        .force("y", d3.forceY(0).strength(0.02))
        .on("tick", function(){
            if (numTicks > ticksToSkip){
                ticked();
                numTicks = 0;
            }
            else {
                numTicks += 1;
            }
        });
}

function clearGFX(){
	svg.remove();
	nodes = [];
	links = [];
}

function addNode(node, nodes, group){
	nodes.push(node);

	var fill = 'white';
	if (node.keyword){
		fill = 'red';
	}

	group
		.append('circle')
		.attr("r", 10)
		.attr('class', 'node')
		.attr('fill', fill)
		.datum(node)
		.call(
			d3.drag()
				.on("start", startDrag)
				.on("drag", drag)
				.on("end", endDrag)
		)
        .on("mouseover", tip.show)
		.on("mouseout", tip.hide)
		.on("dblclick", function(d){
			window.open(d.url);
		})
		.on("click", function(){
			d3.select(this)
				.style('stroke', 'white')
				.style('stroke-width', 5)
				.style('fill', 'grey')
				.style('fill-opacity', 0.2)
				.attr('r', 20)
		})
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





function findParent(parent, links){
	return links.filter(function(e){
		if (e.url == parent.url){
			return e;
		}
	})[0];
}


//inspired by - https://gist.github.com/mbostock/1095795
function updateGFX(node){

	addNode(node, nodes, nodeGroup);
	if (node.parent === null){
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

//performance code from http://stackoverflow.com/questions/26188266/how-to-speed-up-the-force-layout-animation-in-d3-js

// function start() {
//     var ticksPerRender = 3;
//     requestAnimationFrame(function render() {
//         for (var i = 0; i < ticksPerRender; i++) {
//             simulation.tick();
//         }
//
//         nodeGroup
//             .selectAll(".node")
//             .attr("cx", function(d) {return d.x;})
//             .attr("cy", function(d) {return d.y;});
//
//         linkGroup
//             .selectAll(".link")
//             .attr("x1", function(d) {return d.source.x;})
//             .attr("y1", function(d) {return d.source.y;})
//             .attr("x2", function(d) {return d.target.x;})
//             .attr("y2", function(d) {return d.target.y;});
//
//         if (simulation.alpha() > 0) {
//             requestAnimationFrame(render);
//         }
//     });
// }


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
var socket = null;
$(document).ready(function(){
	$('#crawl-form').on('submit', function(e){
        e.preventDefault();
        if (svg){
			clearGFX();
		}
		setupGFX();
		console.log('socketio: connecting to server');

		if (socket){
			console.log('socketio: already connected, forming new connection');
			socket.disconnect();
		}

		socket = io.connect({
			reconnection: false
		});

		var user_input = {};
		user_input.url = $('#url').val();
		user_input.keyword = $('#search_term').val();
		user_input.max_levels = $('#levels').val();
		user_input.crawl_type = $('#crawl_type').val();
		user_input.level = 0;
		user_input.parent = null;
		// setupGFX(user_input);

		socket.emit('reap urls', user_input);
		socket.on('node send', function(node){
			updateGFX(node);
		});
		socket.on('disconnect', function(){
			console.log('server disconnected');
		});
	});
});

