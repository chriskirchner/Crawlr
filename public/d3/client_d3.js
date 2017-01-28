var width = 960;
var height = 500;
var margin = {
	top: '25',
	bottom: '25',
	left: '25',
	right: '25'
};

var svg = d3.select('body')
	.append('svg')
	.attr('width', width)
	.attr('height', height);

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomRange(min, max){
	return Math.random() * (max - min) + min;
}

export default function updateGFX(link){
	var node = svg.data(link).enter().append("circle");
	var randX = getRandomRange(left, width - margin.right);
	var randY = getRandomRange(top, height - margin.bottom);
	node.attr('cx', randX).attr('cy', randY).attr('r', '25');
}

