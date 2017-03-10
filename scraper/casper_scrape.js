/*
	Author: Himal Patel
*/
// Guide - http://docs.casperjs.org/en/latest/quickstart.html

// Ignore comments which are not descriptions, they were used to
// test or debug problems.
var casper = require('casper').create({
	//	clientScripts:  [
		//Path is relative to file location
        //'../../jquery/dist/jquery.js' 

        // These scripts will be injected in remote
        // DOM on every request
   	// ],
   	 verbose: true,
   	 viewportSize:  {width:1200, height:1600}
});

var system = require("system");
//var index = require("../../../index.js");

var s = JSON.parse(casper.cli.get("url")),
ad = JSON.parse(casper.cli.raw.get(0)),
k = JSON.parse(casper.cli.get("kw")),
c = parseInt(JSON.parse(casper.cli.raw.get("cr")));

var	fs = require("fs"),
	utils = require('utils'),
	links,
	text,
	type_DFS = true,
	type_BFS = false,
	array = [],
	startURL = s,//'https://www.google.com',//s,//index.startURL(),//'https://www.google.com',//'https://www.google.com', 
	titles,
	nextLinks = [],
	searchType = type_DFS,		// DFS is true - BFS is false
	additionalScrapeValue = ad-1,//dindex.additionalScrapeValue(), 		// This is what the user requested for the layers in BFS/DFS
	keywordSearch = true,		// False if no keyword was entered
	keywordFound = false,
	keyword = k,//index.keyword(),//"jackal",
	timeStart = performance.now();

// if dfs or bfs value represented on website
if ( c === 0){
		searchType = type_DFS;		// DFS is true - BFS is false
}
else if ( c === 1){
		searchType = type_BFS;		// DFS is true - BFS is false

}
//console.log(startURL);
//console.log(additionalScrapeValue);
//console.log(JSON.stringify(keyword));
//console.log(JSON.stringify(typeof(keyword)));

//	console.log(c);//index.crawl_type());
// additionalScrapeValue should not be more than 1 for BFS or the time 
// to scrape rises exponentially
//additionalScrapeValue = 15;

// Used for Scrape choice 2
function getLinks() {
// Scrape the links from the website (all 'anchor')
    var x = document.querySelectorAll('a');
    return Array.prototype.map.call(x, function(e) {

        return e.getAttribute('href');
    });
}
/*
casper.on('http.status.404', function(resource) {
    //console.log('Hey, this one is 404: ' + resource.url, 'ERROR');
});
*/


function findKeyword(word){
	// check if keyword is in body
	var find = casper.fetchText('body').match(word);

	//console.log(JSON.stringify(word));
	//	console.log(JSON.stringify(typeof(word)));

		//console.log(a);
	//console.log(" keyword: "+ keyword);
	if(find === null || !word)
	{
		//console.log(JSON.stringify(" no keyword match"));
	}
	else
	{
		//console.log(" keyword found!");
		//console.log( " halting crawler.. ");
		//console.log(JSON.stringify(" keyword match"));
		keywordFound = true;
		
		//console.log(JSON.stringify(" keyword match"));
		//casper.exit();
		//casper.done();
	}

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
	         //return e.getAttribute('href');
	         return e.href;
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
function verifyUniqueLinks(arr, arr2, arr3, firstSearch, parent_links_array, array_index)
{	// Uncomment to get timed function
	// var t0 = performance.now();
	// Loop through the array and push only unique elements to the r array
	var n = {},
		o = [], firstNode = true,
		r = [];
	//console.log("Total Links:" + arr.length);
	
	for(var i = 0; i < arr.length; i++) 
	{				
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

   			//uploading json object to GFX
   			if ( firstSearch === true && firstNode === true ){
   				
				if( keywordFound === false){
					system.stdout.write(JSON.stringify({
							"url": startURL,
							"parent": {
								"url": startURL,
								"parent": null
							}

					}));
				}
				else
				{
					system.stdout.write(JSON.stringify({
								"url": startURL,
								"parent": {
									"url": startURL,
									"parent": null
								},
								"keyword": true
					}));
					break;
				} 

				firstNode = false;


			}
			
			if (firstSearch === true && firstNode === false){
				if ( keywordFound === false){
   					system.stdout.write(JSON.stringify({
						"url": obj.url,
						"parent_url": obj.parent_url
					}));
				}
				else
				{
					system.stdout.write(JSON.stringify({
						"url": obj.url,
						"parent_url": obj.parent_url,
						"keyword": true
					}));
					break;
				}
				
			}

			if( firstSearch === false && parent_links_array.length > 0
				&& obj.url != undefined && parent_links_array[array_index] != undefined){
				//findKeyword(keyword);
				//console.log(JSON.stringify("Reached here"));
				//casper.exit();
				if ( keywordFound === false){
					system.stdout.write(JSON.stringify({
						"url": obj.url,
						"parent_url": parent_links_array[array_index]
						}
					));
				}
				else{
					if(array_index > 0){
						system.stdout.write(JSON.stringify({
							"url": obj.parent_url,
							"parent_url": parent_links_array[array_index-1],
							"keyword": true
							}
						));
					}
					else if ( array_index == 0 ){

						system.stdout.write(JSON.stringify({
							"url": obj.parent_url,
							"parent_url": startURL,
							"keyword": true
							}
						));
					}
					break;
				}

			}
   			// store all links in an array
   			nextLinks.push(arr[i]);
   			
			r.push( obj ); 
		}
		//count++;
	}

	return r;
}

function unique_DFS_Links(arr)
{	// Uncomment to get timed function
	// var t0 = performance.now();
	// Loop through the array and push only unique elements to the r array
	var n = {},
		r = [];
	// clear array contents
	nextLinks = [];

	//console.log("Total Links:" + arr.length);
	for(var i = 0; i < arr.length; i++) 
	{				
		//filter links
		if (!n[arr[i]] && (!arr[i].search(/^http[s]?:\/\//)) 
			&& (arr[i] != startURL) && (arr[i] != (startURL + '/')) 
			&& ( !n[(arr[i] + '/')]) && ( !n[(arr[i].replace(/\/+$/, ""))]) )
			//&& (arr2[i].replace(/\s/g, "").length) ) 
		{
			// next line is important do not delete
			n[arr[i]] = true;


   			nextLinks.push(arr[i]);
		}

	}
	//console.log("Filtered Links:" + nextLinks.length);
}

function BFS(integerLayersDeep){

	// This function will get all the links from each page that the scraper visits

	var cntr = 1,
		arr_idx = 0,
		out_arr_idx = 0;
	var urls = [];
	var parent_links = nextLinks;
	urls = nextLinks;
	nextLinks = [];
	array = [];

	// BFS should not be more than limit 2
	if(integerLayersDeep > 1){
		integerLayersDeep = 1;
	}

  casper.repeat(integerLayersDeep, function() {
  	//urls = nextLinks;
  	arr_idx = 0;
  	nextLinks = [];
  	array = [];
    this.eachThen(urls, function(response) {
	  this.thenOpen(response.data, function(response) {
	    //console.log('Opened', this.getCurrentUrl());
	        casper.waitForSelector("a");
	        titles = this.evaluate(getAnchorTitle);
            text = this.evaluate(getAnchorText);
    	    links = this.evaluate(getAnchorHref);

    	    if ( keywordFound === false){
    	    	findKeyword(keyword);
            	array = verifyUniqueLinks(links, titles, text, false, parent_links, arr_idx);
        	}
            //var result = JSON.stringify(array, null, "\t");
            //system.stdout.write('\n' + array.url );

        	
		    //urls = nextLinks;
            //system.stdout.write('\n' + parent_links[arr_idx] );
            //console.log("Filtered Links:" + array.length);
            //fs.write("./BFS_"+cntr+".json", JSON.stringify(array, null, "\t"), 'w');
            cntr++;
            arr_idx++;
	  });

	});
	urls = nextLinks;
	  		
  });

	//console.log('In BFS');
}
	
function DFS (integerLayersDeep) {

	var cntr = 1;
	var original_url = startURL;
//console.log(JSON.stringify(integerLayersDeep));
	casper.then(function() {
    
	    while (integerLayersDeep) {
	    		// get random link in array
	    		var item = nextLinks[Math.floor(Math.random()*nextLinks.length)];

		      (function() {
		        casper.thenOpen(item, function() {
	              	//console.log('Opening ' + this.getCurrentUrl());
	              	casper.waitForSelector("a");
	              	//console.log(this.getTitle());
	              	//console.log(this.getCurrentUrl());
			      	
		    	  	links = this.evaluate(getAnchorHref);
		    	  	if ( keywordFound === false){

			          	unique_DFS_Links(links);
			          	var obj = new Object();
	   						obj.url = this.getCurrentUrl();
	   						obj.parent_url = original_url;
	   						obj.title = this.getTitle();

	   					array = [];
	   					array.push(obj);
	   					findKeyword(keyword);

	   					if ( keywordFound === false){
		   					system.stdout.write(JSON.stringify({
								"url": obj.url,
								"parent_url": obj.parent_url
							}));
	   					}
	   					else
	   					{
	   						system.stdout.write(JSON.stringify({
								"url": obj.url,
								"parent_url": obj.parent_url,
								"keyword": true
							}));
	   					}
	   				}			
   					original_url = this.getCurrentUrl();
		          	item = nextLinks[Math.floor(Math.random()*nextLinks.length)];
		           	//fs.write("./DFS_"+cntr+".json", JSON.stringify(array, null, "\t"), 'w');
		           	cntr++;
		        });
		      })(integerLayersDeep);

		      integerLayersDeep--;

		    }

	});
	//console.log('In DFS');
}

casper.start(startURL, function() {
//	Scrape method Choice 1( more consistent, a)
	// BFS
	if( searchType === type_BFS){
		casper.waitForSelector("a");
		titles = this.evaluate(getAnchorTitle);
	    text = this.evaluate(getAnchorText);
	    links = this.evaluate(getAnchorHref);
	}

	// DFS
	if( searchType === type_DFS){
		//console.log('Opened ' + startURL);
      	casper.waitForSelector("a");
      	
	  	links = this.evaluate(getAnchorHref);

	  	//findKeyword(keyword);
	}
  	
 	// Scrape method Choice 2(inconsistent by about 100 links at times)
    // Propagate array links
    //links = this.evaluate(getLinks);
    
});

casper.then(function() {
   // filter links then add to array
   // BFS
	if( searchType === type_BFS){
		findKeyword(keyword);
		array = verifyUniqueLinks(links, titles, text, true);
	  	//console.log("Filtered Links:" + array.length);

		//fs.write("./BFS_0.json", JSON.stringify(array, null, "\t"), 'w');
		//fs.write("./linktest.json", JSON.stringify(titles, null, "\t"), 'w');
	}

	
	// DFS
	if( searchType === type_DFS){
		
		unique_DFS_Links(links);
	  	var obj = new Object();
			obj.url = startURL;
			obj.parent_url = "";
			obj.title = casper.getTitle();

		array.push(obj);
		findKeyword(keyword);

		if(keywordFound === false){
			system.stdout.write(JSON.stringify({
						"url": obj.url,
						"parent": {
							"url": obj.url,
							"parent": null
						}
			}));
		}
		else
		{
			system.stdout.write(JSON.stringify({
						"url": obj.url,
						"parent": {
							"url": obj.url,
							"parent": null
						},
						"keyword": true
			}));
		}
		
	   	//fs.write("./DFS_0.json", JSON.stringify(array, null, "\t"), 'w');
	}
		

});


casper.then(function() {
		

	// takes the number of urls to scrape
	// BFS
	if( searchType === type_BFS){
		BFS(additionalScrapeValue);
	}
	
	// DFS
	if( searchType === type_DFS){
		findKeyword(keyword);
		DFS(additionalScrapeValue);
		//console.log("second then");
	}
	
});

casper.run(function() {
		

	//console.log("in run");
	var timeEnd = performance.now();
	//console.log('It took ' + ((timeEnd - timeStart)/1000) + ' s');
    //casper.done();
});

//casper.done();


