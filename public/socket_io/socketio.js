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
var svgLinks, svgNodes;

var numTicks = 0;
var ticksToSkip = 0;

// var tip = d3.tip()
//     .attr('class', 'd3-tip')
//     .offset([-10, 0])
//     .html(function(d){
//         return "<strong>URL:</strong> <span style='color:red'>" + d.url + "</span>"
//     });

function setupGFX(){

    //setup viewport with width and height
    svg = d3.select('section')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
		// .call(tip);

    //setup groups
    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    linkGroup = g.append("g");
    nodeGroup = g.append("g");

    //setup force layout template
    simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-10))
        .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(90))
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

function addLink(link_start, link_end, group){
    group
        .append('line')
        .attr('class', 'link')
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .datum({source: link_start, target: link_end});
}

function addNode(node, group){

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
		.on("click", function(d){
			onNodeClick(d)
		});
		// .on("click", function(){
		// 	d3.select(this)
		// 		.style('stroke', 'white')
		// 		.style('stroke-width', 5)
		// 		.style('fill', 'grey')
		// 		.style('fill-opacity', 0.2)
		// 		.attr('r', 20)
		// })
}

function onNodeClick(data){

}

var root;

function addNodeToData(root, node){
    var child = {'url': node.url};
    if(node.parent == null){
		root = child;
		root.fx = 0;
		root.fy = 0;
	}
	else {
        var parent = findParent(root, node.parent.url);
        if (parent == null){
        	console.log(node);
        	console.log(node.parent);
		}
		if (!parent.children){
			parent.children = [];
		}
		parent.children.push(child);
	}
	return root;
}

function findParent(root, parent_url){
	if (root.url == parent_url){
		return root;
	}
	else if (root.children){
		for (var i=0; i<root.children.length; i++){
			var parent = findParent(root.children[i], parent_url);
			if (parent != null){
				return parent;
			}
		}
	}
	return null;
}


// https://jsfiddle.net/t4vzg650/6/
// flatten hierarchical data into array
function getNodes(root){
	var nodes = [];
	function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        nodes.push(node.data)
    }
	recurse(root);
	return nodes;
}

var nodeSvg, linkSvg, nodeEnter, linkEnter;

var hierarchy;

// function updateXY(root, hierarchy){
// 	root.x = hierarchy.x;
// 	root.y = hierarchy.y;
// 	if (root.children) {
// 		for (var i=0; i<root.children.length; i++){
// 			updateXY(root.children[i], hierarchy.children[i]);
// 		}
// 	}
// }

function getLinks(root){
    var links = [];
    function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (node.parent){
            links.push({source: node.parent.data, target: node.data});
        }
        else {
            links.push({source: node.data, target: node.data});
        }
    }
    recurse(root);
    return links;
}

function addToGFX(node){

    // if (node.parent != null){
    //     updateXY(root, hierarchy);
    // }
    root = addNodeToData(root, node);
    hierarchy = d3.hierarchy(root);
    var nodes = getNodes(hierarchy);
    var links = getLinks(hierarchy);

    linkSvg = linkGroup.selectAll(".link")
        .data(links);

    linkSvg.exit().remove();

    var linkEnter = linkSvg.enter()
        .append("line")
        .attr('class', 'link')
        .attr('stroke', 'white')
        .attr('stroke-width', 1);

    // linkSvg = linkEnter.merge(linkSvg);

    nodeSvg = nodeGroup.selectAll(".node")
        .data(nodes, function(d){
        	return d.data;
		});

    nodeSvg.exit().remove();

    var nodeEnter = nodeSvg.enter()
        .append("circle")
		.attr("r", 10)
		.attr('fill', 'white')
        .attr("class", "node")
        // .on("click", click)
        .call(d3.drag()
            .on("start", startDrag)
            .on("drag", drag)
            .on("end", endDrag));


    // nodeSvg = nodeEnter.merge(nodeSvg);

    // svgLinks = linkGroup.selectAll(".link")
		// .data(links, function(d){
		// 	return d.target.url;
		// })
		// .exit()
		// .remove()
		// .enter()
		// .append("line")
    //     .attr('class', 'link')
    //     .attr('stroke', 'white')
    //     .attr('stroke-width', 1)
		// .merge(svgLinks);
    //
    // svgNodes = nodeGroup.selectAll(".node")
		// .data(nodes, function(d){
		// 	return d.url;
		// })
		// .exit()
		// .remove()
		// .enter()
    //     .append('circle')
    //     .attr("r", 10)
    //     .attr('class', 'node')
    //     .attr('fill', fill)
    //     .call(
    //         d3.drag()
    //             .on("start", startDrag)
    //             .on("drag", drag)
    //             .on("end", endDrag)
    //     )
    //     .on("mouseover", tip.show)
    //     .on("mouseout", tip.hide)
    //     .on("dblclick", function(d){
    //         window.open(d.url);
    //     })
    //     .on("click", function(d){
    //         onNodeClick(d)
    //     })
		// .merge(svgNodes);

    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
    // console.log(root);
    // console.log(nodes);
    // console.log(links);
}

// //inspired by - https://gist.github.com/mbostock/1095795
// function addToGFX(node){
//
//     addNode(node, nodes, nodeGroup);
//     if (node.parent === null){
//         //fix root node
//         nodes[0].fx = 0;
//         nodes[0].fy = 0;
//         node.parent = null;
//     }
//     var parent = findParent(node.parent, nodes);
//
//     addLink(parent, node, links, linkGroup);
//
//
//     simulation.nodes(nodes);
//     simulation.force("link").links(links);
//     simulation.alpha(1).restart();
//     // console.log(links.toString());
//     // console.log(nodes);
// }

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



// function setupGFX(start){
// 	addNode(start, nodes, nodeGroup);
// 	addLink(start, start, links, linkGroup);
//
// 	//fix root node to center
// 	nodes[0].fx = 0;
// 	nodes[0].fy = 0;
// }





// function findParent(parent, links){
// 	return links.filter(function(e){
// 		if (e.url == parent.url){
// 			return e;
// 		}
// 	})[0];
// }








//performance code from http://stackoverflow.com/questions/26188266/how-to-speed-up-the-force-layout-animation-in-d3-js

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
			addToGFX(node);
		});
		socket.on('disconnect', function(){
			console.log('server disconnected');
		});
	});
});

