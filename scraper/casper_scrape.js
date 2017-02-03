/*
	Author: Himal Patel
*/
// Guide - http://docs.casperjs.org/en/latest/quickstart.html

// Ignore comments which are not descriptions, they were used to
// test or debug problems.
var casper = require('casper').create({
		clientScripts:  [
		//Path is relative to file location
        '../../jquery/dist/jquery.js' 

        // These scripts will be injected in remote
        // DOM on every request
   	 ],
   	 verbose: true,
   	 viewportSize:  {width:1200, height:1600}
	});
//casper.userAgent("Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.131 Safari/537.36");

var	fs = require("fs"),
	utils = require('utils'),
	links,
	text,
	array = [],
	startURL = 'https://nytimes.com', 
	titles,
	nextLinks = [],
	additionalScrapeValue, 		// This is what the user requested for the layers in BFS/DFS
	timeStart = performance.now();

// remove later
additionalScrapeValue = 3;

// Used for Scrape choice 2
function getLinks() {
// Scrape the links from the website (all 'anchor')
    var x = document.querySelectorAll('a');
    return Array.prototype.map.call(x, function(e) {

        return e.getAttribute('href');
    });
}

function getLinkTitles() {
/* Scrape the links from the website (all 'anchor')
    var x = document.querySelectorAll('a');
    return Array.prototype.map.call(x, function(e) {
        var $variable = $(x).html(); 
        console.log($variable);
    });
*/
	 //require('utils').dump(getElementsInfo('a'));

	
	/*
 $("a").each(function(){
    	var textShow = $(this).text();
    	//var htmlShow = $(this).html();
    	titles.push(textShow);
    	//html.push(htmlShow);
	});
	*/
}

function getAnchorText() {

    var elements = __utils__.findAll('a');
       	
    return elements.map(function(e) {
		//console.log(e.getAttribute('href'));
	    return e.text;	       
    });

}

function getAnchorTitle() {

    var elements = __utils__.findAll('a');
       	
    return elements.map(function(e) {
		//console.log(e.getAttribute('href'));
	    return e.title;	       
    });

}

function getAnchorHref() {

    var elements = __utils__.findAll('a');
       	return elements.map(function(e) {
			//console.log(e.getAttribute('href'));
	         return e.getAttribute('href');
    });
     
}

function formatString(validString){

	// filter titles
	// filter newline characters
	validString = validString.replace(/\r?\n|\r/g, "");
	// filter multiple spaces
	validString = validString.replace(/  +/g, " ");
	// filter escaped double quotes
	validString = validString.replace(/\"/g, '"');
	// filter escaped single quotes
	validString = validString.replace(/\'/g, "'");
	// filter blank lines
	validString = validString.replace(/^\s*$/g, "");

	return validString;
}
// arr = links
// arr2 = titles
// arr3 = text
function verifyUniqueLinks(arr, arr2, arr3)
{	//Uncomment to get timed function
//	var t0 = performance.now();
	// Loop through the array and push only unique elements to the r array
	var n = {},
		o = [], count = 0,
		r = [];
	console.log("Total Links:" + arr.length);
	for(var i = 0; i < arr.length; i++) 
	{				//o[ arr[i] ] = false ;
		//filter links
		if (!n[arr[i]] && (!arr[i].search(/^http[s]?:\/\//)) 
			&& (arr[i] != startURL) && (arr[i] != (startURL + '/')) 
			&& ( !n[(arr[i] + '/')]) && ( !n[(arr[i].replace(/\/+$/, ""))]) )
			//&& (arr2[i].replace(/\s/g, "").length) ) 
		{
			// next line is important do not delete
			n[arr[i]] = true;

			// prepare formatting for future JSON conversion
			var obj = new Object();
   			obj.url = arr[i];
   			obj.parent_url = casper.getCurrentUrl();

   			arr2[i] = formatString(arr2[i]);
   			arr3[i] = formatString(arr3[i]);
   			// If title is blank
   			if(arr2[i] === ""){
   				obj.title = arr3[i];
   			}
   			else
   			{
   				obj.title = arr2[i];
   			}

   			// store all links in an array
   			nextLinks.push(arr[i]);
   			//o[ arr[i] ] = true; 
   			//console.log(o[arr[i]]);
			r.push( obj ); 
		}
		count++;
	}
//	var t1 = performance.now();
//	console.log("Function took " + (t1 - t0) + " milliseconds.");
//  console.log(Object.keys(o).length);
	//console.log("Count is:" + count);
	//maps = o;
	//console.log("Map size:" + Object.keys(maps).length);

	return r;
}


function BFS(integerLayersDeep){

	
/*
	while(BFS_layers)
	{	console.log(BFS_layers-1);
		startURL = nextLinks[BFS_layers-1];
		casper.thenOpen(nextLinks[BFS_layers-1] ,function() {
		    //console.log(utils.betterTypeOf(links[3]));
		    //titles = this.evaluate(getLinkTitles);
		    //console.log(titles.length);
		    //console.log(links.length);

		    /* hash 
		    for(var i = 0; i < links.length; i += 1) {
		  		map[ links[i] ] = titles[i];
			}
		    //console.log(html.length);
		    //exit();
		    

		    casper.waitForSelector("a");
		    titles = this.evaluate(getAnchorText);
		    links = this.evaluate(getAnchorHref);
		    
		});

		casper.then(function(){
    		array = verifyUniqueLinks(links, titles);
		});

		casper.then(function(){
		    fs.write("./BFS_"+BFS_layers+".json", JSON.stringify(array, null, "\t"), 'w');
		});
		BFS_layers--;
	}
	casper.then(function() {
   
    var BFS_layers = 5;

    while(BFS_layers) {
        (function() {
            casper.thenOpen(nextLinks[BFS_layers-1], function() {
                casper.waitForSelector("a");
		    	titles = this.evaluate(getAnchorText);
		    	links = this.evaluate(getAnchorHref);
		    	startURL = getCurrentURL();
		    	console.log(startURL);
            });
            casper.then(function(){
                array = verifyUniqueLinks(links, titles);
                
                fs.write("./BFS_"+BFS_layers+".json", JSON.stringify(array, null, "\t"), 'w');
                           
            });
        })(BFS_layers);
        BFS_layers--;
       	console.log(BFS_layers);

    	}
	});
	*/
	var urls = nextLinks.slice(0, integerLayersDeep);

	var cntr = 1;
	casper.eachThen(urls, function(response) {
	  this.thenOpen(response.data, function(response) {
	    console.log('Opened', response.url);
	       casper.waitForSelector("a");
	       titles = this.evaluate(getAnchorTitle);
           text = this.evaluate(getAnchorText);
    	   links = this.evaluate(getAnchorHref);
           //startURL = this.getCurrentURL();
           //console.log(startURL);
           array = verifyUniqueLinks(links, titles, text);
           console.log("Filtered Links:" + array.length);
           fs.write("./BFS_"+cntr+".json", JSON.stringify(array, null, "\t"), 'w');
           cntr++;
	  });
	});
	console.log('In BFS');
}
	
casper.start(startURL, function() {
//	Scrape method Choice 1( more consistent, a)
	casper.waitForSelector("a");
	titles = this.evaluate(getAnchorTitle);
    text = this.evaluate(getAnchorText);
    links = this.evaluate(getAnchorHref);

  	
 	// Scrape method Choice 2(inconsistent by about 100 links at times)
    // Propagate array links
    //links = this.evaluate(getLinks);
    
});
/*
casper.start('http://google.com/search?q=foo', function() {
    this.echo(this.fetchText('a'));
}).run();
*/
casper.then(function() {
   // filter links then add to array
	array = verifyUniqueLinks(links, titles, text);
  	console.log("Filtered Links:" + array.length);

	fs.write("./link_results.json", JSON.stringify(array, null, "\t"), 'w');
	fs.write("./linktest.json", JSON.stringify(titles, null, "\t"), 'w');
	
	//console.log(nextLinks[0]);

	
	
});


casper.then(function() {
	// takes the number of urls to scrape
	BFS(additionalScrapeValue);
	/*
	casper.each(nextLinks, function(self, link) {
    	self.thenOpen(link, function() {
        	this.echo(this.getTitle());
    	});
	});
	*/
});

casper.run(function() {
		
//	var t0 = performance.now();
//	var t1 = performance.now();
//	console.log("Function took " + (t1 - t0) + " milliseconds.");
	//var keys = Object.keys(maps);
	//console.log(keys);
/* Uncomment to view links and array size
	for(var i in array) {
    	console.log(array[i]);
	}
*/
	console.log("in run");
	var timeEnd = performance.now();
	console.log('It took ' + ((timeEnd - timeStart)/1000) + ' s');
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


