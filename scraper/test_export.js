/**
 * Created by ev on 2/2/17.
 */


function findParent(parent, links){
	return links.filter(function(e){
		if (e == parent){
			return e;
		}
	})[0]
}

links = ['dog', 'cat', 'parent'];
parent = 'parent';
console.log(findParent(parent, links));