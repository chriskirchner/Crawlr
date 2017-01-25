/*
	Author: Himal Patel
*/

var casper = require('casper').create(),
	fs = require("fs"),
	utils = require('utils'),
	links,
	array = [],
	startURL = 'http://www.nytimes.com',
	timeStart = performance.now();


// Used for Scrape choice 2
function getLinks() {
// Scrape the links from the website (all 'anchor')
    var x = document.querySelectorAll('a');
    return Array.prototype.map.call(x, function(e) {
        return e.getAttribute('href');
    });
}

casper.start(startURL, function() {
//	Scrape method Choice 1( more consistent, a)
    links = this.evaluate(function() {
        var elements = __utils__.findAll('a');
        return elements.map(function(e) {
				//console.log(e.getAttribute('href'));
	            return e.getAttribute('href');
        });
    });
  
 	// Scrape method Choice 2(inconsistent by about 100 links at times)
    // Propagate array links
    //links = this.evaluate(getLinks);
    
});


casper.then(function() {
    //console.log(utils.betterTypeOf(links[3]));
    // fill in later
});
	
function verifyUniqueLinks(arr)
{	//Uncomment to get timed function
//	var t0 = performance.now();
	// Loop through the array and push only unique elements to the r array
	var n = {},
		r = [];

	for(var i = 0; i < arr.length; i++) 
	{
		if (!n[arr[i]] && (!arr[i].search(/^http[s]?:\/\//)) 
			&& (arr[i] != startURL) && (arr[i] != (startURL + '/')) 
			&& ( !n[(arr[i] + '/')]) && ( !n[(arr[i].replace(/\/+$/, ""))]) ) 
		{
			n[arr[i]] = true;

			var obj = new Object();
   			obj.url = arr[i]; 

			r.push( obj ); 
		}
	}
//	var t1 = performance.now();
//	console.log("Function took " + (t1 - t0) + " milliseconds.");

	return r;
}


casper.run(function() {
		
//	var t0 = performance.now();
	array = verifyUniqueLinks(links);
//	var t1 = performance.now();
//	console.log("Function took " + (t1 - t0) + " milliseconds.");

/* Uncomment to view links and array size
	for(var i in array) {
    	console.log(array[i]);
	}
*/
	console.log(array.length);

	fs.write("./link_results.json", JSON.stringify(array, null, "\t"), 'w');
	var timeEnd = performance.now();
	console.log('It took ' + ((timeEnd - timeStart)/1000) + ' s.');
	
    casper.done();
});
// Keeping commented in case it is needed for future use(Delete before turning in)
/*	
    //this.echo(JSON.stringify(links)).exit();
    //wait(1000);
    
	


    var unique = links.filter(function(listItem, i, array){
    	var t0 = performance.now();

    	if(!links[i].search(/^http[s]?:\/\//)){
    		return array.indexOf(listItem) === i; 
    	}
    	var t1 = performance.now();
		console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
    });

    for(var i in unique) {
        console.log(unique[i]);
    }

	console.log(unique.length);
*/
/*
function getLinks() {
// Scrape the links from top-right nav of the website
    var links = document.getElementsByTagName('a');

    return Array.prototype.map.call(links, function (e) {
		        
		return e.getAttribute('href')
    });
}

// Opens casperjs homepage
casper.start('http://nytimes.com/', function(){
	//array = this.evaluate(this.getElementsAttribute('a', 'title'));
});

casper.then(function () {
    links = this.evaluate(getLinks);


});

casper.run(function () {
/*
    for(var i in links) {
        console.log(links[i]);
    }
	console.log(links.length);
// /	
	for(var i in array) {
        console.log(array[i]);
    }
	console.log(array.length);

	var timeEnd = performance.now();
	console.log('It took ' + ((timeEnd - timeStart)/1000) + ' s.');
    casper.done();
});

for(i = 0; i<links.length; i++){
				if(	(e.getAttribute('href') == links[i]) ||  (e.getAttribute('href') == "" ) )
				{
					
					return;									
				}

			}

function getLinks() {
    var links = document.querySelectorAll('a');
    return Array.prototype.map.call(links, function(e) {
        return e.getAttribute('href');
    });
}

	

casper.start(startURL, function() {
   // Wait for the page to be loaded
   //this.waitForSelector('form[action="/search"]');
});

casper.then(function() {
    // aggregate results for the 'phantomjs' search
    links = this.evaluate(getLinks);
});

casper.run(function() {
    // echo results in some pretty fashion
    this.echo(links.length + ' links found:');
    this.echo(' - ' + links.join('\n - ')).exit();
});		
Author: Himal Patel	
*/


