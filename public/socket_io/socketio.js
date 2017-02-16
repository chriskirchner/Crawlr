/**
 * Created by ev on 1/24/17.
 */

//set size of viewport
var width = 960,
	height = 960;

//setup edge and node lists
var nodes = [],
	links = [];

var root;

//setup variables
var simulation, svg, g, linkGroup, nodeGroup;
var svgLinks, svgNodes;
var link_count = 0;

var numTicks = 0;
var ticksToSkip = 0;

//350 ideal
var MAX_NODES = 350;
var NODE_RADIUS = 8;
var GFX_UPDATE_INTERVAL = 20;
var KEYWORD_NODE_RADIUS = 12;

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d){
        html = "<strong>URL:</strong> <span style='color:red'>" + d.url + "</span>" + "<br>" +
            	"<strong>Count:</strong> <span style='color:red'>" + d._child_count + "</span>";
        return html;
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
        .force("link", d3.forceLink().distance(90))
        .force("x", d3.forceX(0).strength(0.005))
        .force("y", d3.forceY(0).strength(0.005))
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
	root = null;
}

var num = 0;

function addToTree(root, node){
	// console.log(num++);
    // var dateTime = new Date();
    // var time = dateTime.getTime();
    // console.log(link_count++);
	var parent = null;
    var child = {
    	'url': node.url,
		'timestamp': num++,
		'children': [],
		'_children': [],
		'collapsed': false,
		'_child_count': 0,
		'keyword': node.keyword
    };

    if(node.parent == null){
		root = child;
		root.fx = 0;
		root.fy = 0;
	}
	else {
        parent = findParent(root, node.parent.url);
		if (!parent.children){
			parent.children = [];
		}
		child.parent = parent;
		parent.children.push(child);
        //update parents time as well
        while (parent != null){
            // parent.timestamp = time;
			parent.timestamp = num++;
			parent._child_count++;
            parent = parent.parent;
        }
	}

	return root;
}

function findParent(root, parent_url){
	if (root.url == parent_url){
		return root;
	}
	if (root.children.length > 0){
		for (var i=0; i<root.children.length; i++){
			var parent = findParent(root.children[i], parent_url);
			if (parent != null){
				return parent;
			}
		}
	}
	if (root._children.length > 0){
        for (var i=0; i<root._children.length; i++){
            var parent = findParent(root._children[i], parent_url);
            if (parent != null){

            	//make child observable if previously hidden
                root.children.push(root._children[i]);
            	root._children.splice(i, 1);

            	p = root;
            	while (p != null){
            		p = p.parent;
				}

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
        nodes.push(node);
    }
	recurse(root);
	return nodes;
}

var nodeSvg, linkSvg, nodeEnter, linkEnter;

function getLinks(root){
    var links = [];
    function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (node.parent){
            links.push({source: node.parent, target: node});
        }
        else {
            links.push({source: node, target: node});
        }
    }
    recurse(root);
    return links;
}

function addToGFX(node){
    root = addToTree(root, node);
    updateGFX(root);
    restyleGFX(root);
    simulation.alpha(1).restart();
}


var powerScale = d3.scalePow()
// // .domain([0, MAX_NODES])
// // .range([NODE_RADIUS, 50]);
    .exponent(0.6);

//post-order traversal
function trimTree(root, nodes){
	var trimTime = getTrimTime(nodes);
	function recurse(node){
		if (node.children) node.children.forEach(recurse);
		if (node.timestamp <= trimTime){

			//hide node
			if (node.parent){
                var parent = node.parent;
                parent._children.push(node);
                var index = parent.children.indexOf(node);
                parent.children.splice(index, 1);
			}

			//update total child count for parents
			p = node.parent;
			while(p != null){
				// p._child_count++;
                //grow parent radius
                // d3.select('[href="'+p.url+'"]')
                // styleSuperNode('[href="'+p.url+'"]');
                p = p.parent;
			}
		}
	}
	recurse(root);
}



function getTrimTime(nodes){
	var times = getTimes(nodes);
	times.sort();
	var numNodesToTrim = nodes.length - MAX_NODES;
	return times[numNodesToTrim-1];
}

function getTimes(nodes){
	return nodes.map(function(node){
		return node.timestamp;
	})
}



function updateGFX(root){
    var nodes = getNodes(root);
    if (nodes.length >= MAX_NODES){
        trimTree(root, nodes);
		nodes = getNodes(root);
    }
    var links = getLinks(root);

    //refactor code

    linkSvg = linkGroup.selectAll(".link")
        .data(links);

    linkSvg.exit().remove();
    var linkEnter = linkSvg.enter()
        .append("line")
        .attr('class', 'link')
        .attr('stroke', 'white')
        .attr('stroke-width', 1);

    linkSvg = linkEnter.merge(linkSvg);

	nodeSvg = nodeGroup.selectAll('.node')
		.data(nodes, function(d){
			return d.url;
		});

	nodeSvg.exit().remove();

    var nodeEnter = nodeSvg
        .enter()
        .append("circle")
        .attr('href', function(d){
            return d.url;
        })
		.attr('class', 'node')
        .attr('r', NODE_RADIUS)
        .style('fill', 'white')
        .on("click", click)
		.on('dblclick', function(d){
			window.open(d.url);
		})
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .call(d3.drag()
            .on("start", startDrag)
            .on("drag", drag)
            .on("end", endDrag));


    nodeSvg = nodeEnter.merge(nodeSvg);

    simulation.nodes(nodes);
    simulation.force("link").links(links);

}



// function transformPosition(d){
// 	return "translate(" + d.x + "," + d.y + ")";
// }

function restyleGFX(root) {
    function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (node.keyword == true){
        	styleKeywordNode('[href="' + node.url + '"]');
		}
        if (node._children.length > 0) {
            styleSuperNode('[href="' + node.url + '"]');
            node.collapsed = true;
        }
        else if (node._children.length == 0 && node.collapsed == true) {
            styleRegNode('[href="' + node.url + '"]');
            node.collapsed = false;
        }
    }
    recurse(root);
}

function styleKeywordNode(node_selector){
    nodeGroup.select(node_selector)
        .attr('r', function(d){
            return powerScale(d._child_count) + NODE_RADIUS;
        })
		.attr('r', KEYWORD_NODE_RADIUS)
        .style('fill', 'red')
        .style('fill-opacity', 0.2)
		.style('stroke','#eb0000')
		.style('stroke-width', 5);
}

function styleSuperNode(node_selector){
    nodeGroup.select(node_selector)
        .attr('r', function(d){
            return powerScale(d._child_count) + NODE_RADIUS;
        })
        .style('stroke', 'white')
        .style('stroke-width', 5)
        .style('fill', 'grey')
        .style('fill-opacity', 0.2);
}

function styleRegNode(node){
    nodeGroup.selectAll(node)
        .attr('r', NODE_RADIUS)
        .style('fill', 'white')
		.style('fill-opacity', 1);
}

function click(d){

	var nodes = getNodes(root);
	var hidden = 0;
	var shown = 0;
	for (var i=0; i<nodes.length; i++){
		hidden += nodes[i]._children.length;
		shown += nodes[i].children.length;
	}
    // var dt = new Date();
    // d.timestamp = dt.getTime();
	d.timestamp = num++;

	if (d._children.length == 0
		&& d.children.length == 0){
		return;
	}
	else if (d._children.length > 0){
        // var child_count = d._children.length;
        //update time stamps
		//bug here i think
		d._children.forEach(function(child){
			// dt = new Date();
			// child.timestamp = dt.getTime();
			child.timestamp = num++;
		});
		d.children = d.children.concat(d._children);
		d._children = [];

        //update total child count for parents
        var parent = d;
        while(parent != null){
            // parent._child_count -= child_count;
            parent = parent.parent;
        }
    }
	else if (d._children == 0){

        // var child_count = d.children.length;
		d._children = d._children.concat(d.children);
		d.children = [];

        var parent = d;
        while(parent != null){
            // parent._child_count += child_count;
            parent = parent.parent;
        }
    }

    updateGFX(root);
	restyleGFX(root);
    simulation.alpha(1).restart();

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

//performance code from http://stackoverflow.com/questions/26188266/how-to-speed-up-the-force-layout-animation-in-d3-js

function ticked(){
	// if (nodes.length > 0){
	// 	nodes[0].x = 0;
	// 	nodes[0].y = 0;
	// }
	nodeGroup
		.selectAll(".node")
		// .attr("cx", function(d) {return d.x;})
		// .attr("cy", function(d) {return d.y;})
		.attr('transform', function(d){
				return 'translate(' + d.x + ',' + d.y + ')'
		});

	linkGroup
		.selectAll(".link")
		.attr("x1", function(d) {return d.source.x;})
		.attr("y1", function(d) {return d.source.y;})
		.attr("x2", function(d) {return d.target.x;})
		.attr("y2", function(d) {return d.target.y;})
		// .attr('transform', function(d){
		// 	return 'translate(' + d.source.x + ',' + d.source.y + ')'
		// })
		// .attr('transform', function(d){
		// 	return 'translate(' + d.target.x + ',' + d.target.y + ')'
		// });

    // http://stackoverflow.com/questions/19291316/force-graph-in-d3-js-disappearing-nodes


}

var buffer = [];
function bufferNode(node){
	buffer.push(node)
}

function bufferToGFX(buffer){
	if (buffer.length > 0){
		addToGFX(buffer[0]);
		buffer.splice(0,1);
	}
}

setInterval(function(){
	bufferToGFX(buffer);
}, GFX_UPDATE_INTERVAL);

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
			bufferNode(node)
        });
		socket.on('disconnect', function(){
			console.log('server disconnected');
		});
	});
});

