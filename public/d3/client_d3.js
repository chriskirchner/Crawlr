var width = 960;
var height = 500;
var margin = {
	top: '25',
	bottom: '25',
	left: '25',
	right: '25'
};

var svg = d3.select('section')
	.append('svg')
	.attr('width', width)
	.attr('height', height);

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomRange(min, max){
	return Math.random() * (max - min) + min;
}

function updateGFX(link){
	var randX = getRandomRange(margin.left, width - margin.right);
	var randY = getRandomRange(margin.top, height - margin.bottom);
	var node = d3.select('svg').append('circle');
	node.data(link);
	node.attr('cx', randX).attr('cy', randY).attr('r', '25');
	node.style('fill', 'white');
}
