/**
 * Created by ev on 1/24/17.
 */

/**
 * Script: client_d3.js
 * Description: d3 revolving dynamic collapsible force layout representing BFS search from starting URL.
 * The force layout "revolves" by showing hidden or fresh nodes over old exposed nodes using a "timestamp"
 * so the user is able to eventually find any previously hidden node.  The graphics were mainly inspired
 * by the v4 force layout implementation from static data in the following fiddle:
 * https://jsfiddle.net/t4vzg650/6/ with a lot of customization to make the data dynamic
 * and the force layout revolving.  The traditional approach of using d3.hierarchy to build the force
 * simulation led to poor glitchy graphics.  The hierarchy here is customized for dynamic buffered data.
 * Author: Chris Kirchner
 * Email: kirchnch@oregonstate.edu
 */

//set size of viewport
var width = 960,
	height = 960;

//setup edge and node lists
var nodes = [],
	links = [];

var root;

//setup d3 global variables
var simulation, svg, g, linkGroup, nodeGroup;
var svgLinks, svgNodes;
var link_count = 0;
var nodeSvg, linkSvg, nodeEnter, linkEnter;

//SCRIPT GLOBALS
var MAX_NODES = 350;
var NODE_RADIUS = 8;
var GFX_UPDATE_INTERVAL = 20;
var KEYWORD_NODE_RADIUS = 12;

//options to skip ticks in force layout template to improve performance
//performance code from http://stackoverflow.com/questions/26188266/how-to-speed-up-the-force-layout-animation-in-d3-js
var NUM_TICKS = 0;
var TICKS_TO_SKIP = 0;

//global to hold "timestamp" for nodes to implement revolving force layout
var NUM = 0;

/**
 * creates d3 tool tip (development)
 */

var tip = d3.tip()
	
	//set class
    .attr('class', 'd3-tip')
	//set offset from cursor
    .offset([-10, 0])
	//add html to design tooltip
    .html(function(d){
        html = "<strong>URL:</strong> <span style='color:red'>" + d.url + "</span>" + "<br>" +
            	"<strong>Count:</strong> <span style='color:red'>" + d.timestamp + "</span>";
        return html;
    });


var tip2 = d3.tip()

    //set class
    .attr('class', 'd3-tip2')
    //set offset from cursor
    .offset([50, 0])
    //add html to design tooltip
    .html(function(d){
        html = "<strong>URL:</strong> <span style='color:red'>" + d.data.url + "</span>" + "<br>" +
                "<strong>Count:</strong> <span style='color:red'>" + d.data.timestamp + "</span>";
        return html;
    });


/**
 * setupGFX
 * sets up the d3 graphics layout of elements
 */

function setupGFX_BFS(){

    //setup viewport with width and height

    svg = d3.select('section')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
		.call(tip);

    //setup d3 groups of nodes (websites) and linsk
    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    linkGroup = g.append("g");
    nodeGroup = g.append("g");

    //setup force layout template
    simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-25))
        .force("link", d3.forceLink().distance(90))
        .force("x", d3.forceX(0).strength(0.002))
        .force("y", d3.forceY(0).strength(0.002))
		.force("-x_right", d3.forceX(-width/2).strength(0.02))
		.force("-x_left", d3.forceX(width/2).strength(0.02))
		.force("-y_top", d3.forceY(-height/2).strength(0.02))
		.force("-y_bottom", d3.forceY(height/2).strength(0.02))
		// .force("collision", d3.forceCollide(20).strength(0.1))
        .on("tick", function(){
            if (NUM_TICKS > TICKS_TO_SKIP){
                ticked();
                NUM_TICKS = 0;
            }
            else {
                NUM_TICKS += 1;
            }
        });
}


function setupGFX_DFS(){

    svg = d3.select("section")
    .append("svg")
    .attr('width', width)
    .attr('height', height)
    .call(tip2),
    margin = 20,
    diameter = +svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    color = d3.scaleLinear()
    .domain([-1, 5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl);

    pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);
}
/**
 * clearGFX
 * resets the graphical data (e.g. when user refreshes or clicks crawl again)
 */

function clearGFX(){
	svg.remove();
	nodes = [];
	links = [];
	root = null;
}

var first = 0;


/**
 * addToTree: adds new node to tree ADT
 * @param root: root of tree
 * @param node - new node added to tree
 * @returns {*} - gives back root of tree for readability
 */
function addToTree(root, node){

   

    if (node.level === 0)
        sizeFactor = 10000000;
    else
        sizeFactor = 1000000 / node.level;

    sizeValue = (Math.floor(Math.random() * (sizeFactor * (5 - 1) + 1)) + (sizeFactor * 1)).toString();





	//convert format of node (website page) from scraper to tree for d3
	var parent = null;
    var child = {
    	'url': node.url,
		//timestamp revolves nodes in force layout
		'timestamp': NUM++,
		//represents exposed children
		'children': [],
		//represents hidden children
		'_children': [],
		'collapsed': false,
		//number of child nodes
		'_child_count': 0,
		//boolean if keyword found in website
		'keyword': node.keyword,
		'radius': NODE_RADIUS,
        "size" : sizeValue
    };

    //fix position and root of first node
    if(node.parent == null){
		root = child;
		root.fx = 0;
		root.fy = 0;
	}
	else {
    	//find new node's parent
        parent = findParent(root, node.parent.url);
		if (!parent.children){
			parent.children = [];
		}

		if (parent == null && child != root){
			console.log('not arrived yet');
		}
		//assign child's parent to found parent
		child.parent = parent;
		//add new node to it's parent's list of children
		parent.children.push(child);
        //update parents time and child count
        while (parent != null){
			parent.timestamp = NUM++;
			parent._child_count++;
            parent = parent.parent;
        }
	}

    // var length = getNodes(root).length;
    // if (first == 0 && length == MAX_NODES){
    //     first = 1;
    //     child.keyword = true;
    // }


    return root;
}

/**
 * findParent: finds a new node's parent in tree ADT
 * @param root - root of tree
 * @param parent_url - new node's parent url (search id)
 * @returns {*} - parent of new node, or null if no parent
 */
function findParent(root, parent_url){

	//base case
	if (root.url == parent_url){
		return root;
	}
	//recursively search in list of visible children
	if (root.children.length > 0){
		for (var i=0; i<root.children.length; i++){
			var parent = findParent(root.children[i], parent_url);
			if (parent != null){
				return parent;
			}
		}
	}
	//recursively search in list of collapsed children
	if (root._children.length > 0){
        for (var i=0; i<root._children.length; i++){
            var parent = findParent(root._children[i], parent_url);
            if (parent != null){

            	//make child observable if previously hidden
                root.children.push(root._children[i]);
            	root._children.splice(i, 1);

            	//vestigial search for updating parents
				//may not be needed in final code
                // p = root;
                // while (p != null){
            		// p = p.parent;
				// }

                return parent;
            }
        }
    }
	return null;
}

/**
 * getNodes: returns a list of visible nodes from tree ADT
 * @param root - root of tree
 * @returns {Array} list of visible nodes
 */
function getNodes(root){
	var nodes = [];
	function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        nodes.push(node);
    }
	recurse(root);
	return nodes;
}

/**
 * getLinks: returns a list of links between visible parent and child nodes from tree ADT
 * @param root - root of tree
 * @returns {Array} list of links
 */
function getLinks(root){
    var links = [];
    function recurse(node) {
    	//only returns links from visible children
        if (node.children) node.children.forEach(recurse);
        //setup links with source and target
        if (node.parent){
            links.push({source: node.parent, target: node});
        }
        //setup link with source and target as itself if root node
        else {
            links.push({source: node, target: node});
        }
    }
    recurse(root);
    return links;
}

/**
 * addToGFX: adds new node to d3 graphics
 * @param node - new node from scraper
 */
function addToGFX(node){

    if (node.crawl_type == '1')
    {
        //add new node to tree ADT
        root = addToTree(root, node);
        //update the graphics with new node
        updateGFX_BFS(root);
        //restyle the graphics with new node
        restyleGFX(root);
        //restart the force layout with new node
        simulation.alpha(1).restart();
    }
    else if (node.crawl_type == '0')
    {
        //add new node to tree ADT
        root = addToTree(root, node);
        //update the graphics with new node
        updateGFX_DFS(root);
        
    }
	
}

/**
 * trimTree: trims tree of old nodes using recursive post-order traversal in based on MAX_NODE threshold
 * @param root - root of tree
 * @param nodes - list of nodes in tree
 */
function trimTree(root, nodes){
	//get "time" of youngest exposed node that needs to be trimmed to expose other node(s)
	var trimTime = getTrimTime(nodes);
	//hide all children with times greater or less than trim time
	function recurse(node){
		if (node.children) node.children.forEach(recurse);
		if (node.timestamp <= trimTime){

			//hide node by placing in _children list
			if (node.parent){
                var parent = node.parent;
                parent._children.push(node);
                var index = parent.children.indexOf(node);
                parent.children.splice(index, 1);
                // if (first == 0){
                // 	first = 1;
                // 	node.keyword = true;
                //     console.log(trimTime);
                //
                // }
			}

			//vestigial code that may no longer be handy
			//update total child count for parents
			// p = node.parent;
			// while(p != null){
			// 	// p._child_count++;
             //    //grow parent radius
             //    // d3.select('[href="'+p.url+'"]')
             //    // styleSuperNode('[href="'+p.url+'"]');
             //    p = p.parent;
			// }
		}
	}
	recurse(root);
}


/**
 * getTrimTime: returns the time at which nodes at or older need to be trimmed
 * @param nodes - list of nodes in tree ADT
 * @returns {*} - trim time
 */
function getTrimTime(nodes){
	var times = getTimes(nodes);
	times.sort(function(a,b){
		return a-b;
	});
	var NUMNodesToTrim = nodes.length - MAX_NODES;
	// if (first == 0){
	// 	console.log(times);
	// }
	return times[NUMNodesToTrim-1];
}

/**
 * getTimes: returns list of times belonging to list of nodes
 * @param nodes - list of nodes
 * @returns - list of times
 */
function getTimes(nodes){
	return nodes.map(function(node){
		return node.timestamp;
	})
}

/**
 * updateGFX: updates the d3 force simulation graphics
 * @param root - root of tree ADT
 */
function updateGFX_BFS(root){
	//get list of nodes in tree
    var nodes = getNodes(root);
    //determine if tree needs to be trimmed to sustain graphic performance
    if (nodes.length >= MAX_NODES){
        trimTree(root, nodes);
		nodes = getNodes(root);
    }
    //get list of links from tree
    var links = getLinks(root);

    //add link data to d3 link group
    linkSvg = linkGroup.selectAll(".link")
        .data(links);

    //exit and remove old links
    linkSvg.exit().remove();

    //enter new element links to data and add attributes
    var linkEnter = linkSvg.enter()
		//append d3 line to lonely data
        .append("line")
        .attr('class', 'link')
        .attr('stroke', 'white')
        .attr('stroke-width', 1);

    //merge new list of d3 elements with old list of elements
    linkSvg = linkEnter.merge(linkSvg);

    //add node data to d3 node group
	nodeSvg = nodeGroup.selectAll('.node')
		.data(nodes, function(d){
			return d.url;
		});

	//exit and remove old nodes
	nodeSvg.exit().remove();

	//enter node data, add d3 elements, style
    var nodeEnter = nodeSvg
        .enter()
		//append d3 circle to unassociated data
        .append("circle")
        .attr('href', function(d){
            return d.url;
        })
		.attr('class', 'node')
		//add radius
        .attr('r', NODE_RADIUS)
        .style('fill', 'white')
        .on("click", click)
		//open window on double click
		.on('dblclick', function(d){
			window.open(d.url);
		})
		//show tooltip on hover
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
		//add drag action to node
        .call(d3.drag()
            .on("start", startDrag)
            .on("drag", drag)
            .on("end", endDrag));


    //merge old elements with new elements
    nodeSvg = nodeEnter.merge(nodeSvg);

    //add list of nodes to simulation
    simulation.nodes(nodes);
    //add list of links to simulation
    simulation.force("link").links(links);

}


function updateGFX_DFS(root)
{
    svg.remove();
    setupGFX_DFS();
    root = d3.hierarchy(root)
      .sum(function(d) { return d.size; })
      .sort(function(a, b) { return b.value - a.value; });

  var focus = root,
      nodes = pack(root).descendants(),
      view;

      console.log(root);

  circle = g.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
      .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      .style("fill", function(d) { return d.children ? color(d.depth) : null; })
      .on('dblclick', function(d){
            window.open(d.data.url);
        })
        //show tooltip on hover
        .on("mouseover", tip2.show)
        .on("mouseout", tip2.hide)
      .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });


  node = g.selectAll("circle");
  g.selectAll("circle").filter(function (d){ return d.data.keyword;})
    .style("fill", "grey");

  svg
      .style("background", color(-1))
      .on("click", function() { zoom(root); });

  zoomTo([root.x, root.y, root.r * 2 + margin]);
}

function zoomTo(v) 
{
    var k = diameter / v[2]; view = v;
    node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    circle.attr("r", function(d) { return d.r * k; });
}


function zoom(d)
{
    var focus0 = focus; focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function(t) { zoomTo(i(t)); };
        });

    transition.selectAll("text")
      .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
}

/**
 * click: function called on clicking node
 * @param d - data of clicked node
 */
function click(d){

	//gets list of nodes from tree ADT
    var nodes = getNodes(root);
    var hidden = 0;
    var shown = 0;

    // NEED TO FINISH THIS CODE FOR UPDATING NODE SIZE WITH HIDDEN CHILDREN ONLY
    // for (var i=0; i<nodes.length; i++){
    //     hidden += nodes[i]._children.length;
    //     shown += nodes[i].children.length;
    // }


    //do nothing for regular node
    if (d._children.length == 0
        && d.children.length == 0){
    }
    //expose hidden children
    else if (d._children.length > 0){

    	//update time for all children so they are all visible if possible
        d._children.forEach(function(child){
            child.timestamp = NUM++;
        });
        d.children.forEach(function(child){
            child.timestamp = NUM++;
        });

        //move hidden children to list of visible children
        d.children = d.children.concat(d._children);
        d._children = [];

        //update total child count for parents
        var parent = d;
        while(parent != null){
            parent = parent.parent;
        }
    }
    //collapse node's children
    else if (d._children == 0){

        d._children = d._children.concat(d.children);
        d.children = [];

        var parent = d;
        while(parent != null){
            parent = parent.parent;
        }
    }

    //update time for click node so it will not be trimmed
    // d.timestamp = NUM++;

    //update and restyle simulation
    updateGFX_BFS(root);
    restyleGFX(root);
    simulation.alpha(1).restart();
}

//scales superNodes based on the number of their children
var powerScale = d3.scalePow()
    .exponent(0.6);

/**
 * restyleGFX: restyles the nodes in the force layout if they are supernodes, keyword nodes, etc
 * @param root - root of tree ADT
 */
function restyleGFX(root) {
    function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        //highlights the node where keyword is found
        if (node.keyword == true){
        	styleKeywordNode('[href="' + node.url + '"]');
		}
		//styles the super node with hidden children
        if (node._children.length > 0) {
            styleSuperNode('[href="' + node.url + '"]');
            node.collapsed = true;
        }
        //styles regular node
        else if (node._children.length == 0 && node.collapsed == true) {
            styleRegNode('[href="' + node.url + '"]');
            node.collapsed = false;
        }
    }
    recurse(root);
}



/**
 * styleKeywordNode: styles keyword node
 * @param node_selector - css for node with keyword
 */
function styleKeywordNode(node_selector){
    nodeGroup.select(node_selector)
        .attr('r', function(d){
        	d.radius = KEYWORD_NODE_RADIUS;
            return d.radius;
        })
		.attr('r', KEYWORD_NODE_RADIUS)
        .style('fill', 'red')
        .style('fill-opacity', 0.2)
		.style('stroke','#eb0000')
		.style('stroke-width', 5);
}

/**
 * styleSuperNode: styles collapsed node with hidden children
 * @param node_selector - css selector for node
 */
function styleSuperNode(node_selector){
    nodeGroup.select(node_selector)
        .attr('r', function(d){
            d.radius = powerScale(d._child_count) + NODE_RADIUS;
            return d.radius;
        })
        .style('stroke', 'white')
        .style('stroke-width', 5)
        .style('fill', 'grey')
        .style('fill-opacity', 0.2);
}

/**
 * styleRegNode: styles regular boring nodes
 * @param node - css selector for node
 */
function styleRegNode(node_selector){
    nodeGroup.selectAll(node_selector)
        .attr('r', function(d){
        	d.radius = NODE_RADIUS;
        	return NODE_RADIUS;
        })
        .style('fill', 'white')
		.style('fill-opacity', 1);
}

//drag code taken from bottom link - basically the standard
//https://roshansanthosh.wordpress.com/2016/09/25/forces-in-d3-js-v4/
/**
 * startDrag: function called when node drag is started
 * @param d
 */
function startDrag(d)
{
	//restart the simulation when node is dragged so dragging is not affected by alpha
	simulation.restart();
	//reset alpha to one so drag is not slow, and per cursor movement
	simulation.alpha(1.0);
	//fix x and y so its not affected by simulation
	d.fx = d.x;
	d.fy = d.y;
}

/**
 * drag: function called when node is being dragged
 * @param d
 */
function drag(d)
{
	//fix node's x and y position based on cursor's x and y position
	d.fx = d3.event.x;
	d.fy = d3.event.y;
}

/**
 * endDrag: function called when ending the drag
 * @param d
 */
function endDrag(d)
{
	//allow simulation to take over unfixed x and y
	d.fx = null;
	d.fy = null;
	//restart simulation with default alpha (change over time)
	simulation.alphaTarget(0.1);
}

/**
 * ticked: function called on each tick of the force simulation
 */
function ticked(){

	//update node's x and y positions based on force simulation
	//added transformation does not seem to affect transformation to new positions
    //transformation added with help from bug in
	// http://stackoverflow.com/questions/19291316/force-graph-in-d3-js-disappearing-nodes
	//bound box - https://bl.ocks.org/mbostock/1129492
	nodeGroup
		.selectAll(".node")
		.attr("cx", function(d) {return Math.max(d.radius-width/2, Math.min(width/2-d.radius, d.x));})
		.attr("cy", function(d) {return Math.max(d.radius-height/2, Math.min(height/2-d.radius, d.y));});
		// .attr('transform', function(d){
		// 		return 'translate(' + d.x + ',' + d.y + ')'
		// });

	//updates node link's x and y positions based on force simulation
	linkGroup
		.selectAll(".link")
		.attr("x1", function(d) {return d.source.x;})
		.attr("y1", function(d) {return d.source.y;})
		.attr("x2", function(d) {return d.target.x;})
		.attr("y2", function(d) {return d.target.y;});

}

var buffer = [];
/**
 * bufferNode: buffers a scraped node by adding to buffer list
 * @param node - node to be buffered
 */
function bufferNode(node){
	buffer.push(node);
}

/**
 * bufferToGFX: moves buffered node to graphics
 * @param buffer - list of buffered node's from scraper
 */
function bufferToGFX(buffer){
	if (buffer.length > 0){
		addToGFX(buffer[0]);
		buffer.splice(0,1);
	}
}

/**
 * updates the graphics with scraped node on interval for smoother performance
 */
setInterval(function(){
	bufferToGFX(buffer);
}, GFX_UPDATE_INTERVAL);

//using socket io to update GFX real time BABY! YEH!
var socket = null;
$(document).ready(function(){
	$('#crawl-form').on('submit', function(e){
		//prevent the bubble
        e.preventDefault();

        //reset graphics everytime user issues a crawl
        if (svg){
			clearGFX();
		}

		//setup d3 graphics layout
		
		console.log('socketio: connecting to server');

		//stops scrapping if user clicks refresh
		if (socket){
			console.log('socketio: already connected, forming new connection');
			socket.disconnect();
		}

		//don't allow the client to try to reconnect with server
		socket = io.connect({
			reconnection: false
		});

		//get user input and sent to server
		var user_input = {};
		user_input.url = $('#url').val();
		user_input.keyword = $('#search_term').val();
		user_input.max_levels = $('#levels').val();
		user_input.crawl_type = $('#crawl_type').val();
		user_input.level = 0;
		user_input.parent = null;

		//send user input to server
		socket.emit('reap urls', user_input);

		//upload node from server and add to buffer
		socket.on('node send', function(node){
            if (node.parent === null && node.crawl_type == '0')
            {
                setupGFX_DFS();
            }
            else if (node.parent === null && node.crawl_type == '1')
            {
                setupGFX_BFS();
            }

			bufferNode(node);
        });

		//function called on server disconnect
		socket.on('disconnect', function(){
			console.log('server disconnected');
		});
	});
});

