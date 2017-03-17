# Crawler
Capstone Project - Web Crawler

Chris Kirchner, Christiano Vannellic, Himal Patel

##### Hosted Websites:
http://138.68.29.97:8080
http://138.197.208.219:8200

##### SETUP on Ubuntu (requires sudo):

```chmod +x setup
./setup
node index.js
```

User Instructions
NOTE: The application fits all of required inputs into the navigation bar at the top of the web page.  Additional scraper type options can be found on the top right of the navbar.  The BFS and Single-Path search types, in conjunction with the “html” Python scraper (default), meet all user requirements.  The casperjs (“js”) option has been removed from options (see Discussion of Casper Scraper).

User Input:
Go to “http://138.68.29.97:8080” or “http://138.197.208.219:8200/”
Input the starting URL. (e.g, http://www.sciencekids.co.nz/sciencefacts/animals/cat.html )
<OPTIONAL> Input the desired keyword (the scraper will halt on discovery).
Input the number of levels to traverse (must be greater than 0).
Select a search type (BFS, DFS, or Single-Path DFS)
<OPTIONAL> Specify the desired scraper (HTML, JS, or Scrapy)
We suggest testing on HTML or Scrapy first since JS has had some memory issues
Click “Crawl” (Graph will generate).

Post-Scraping (Force Layout) 
Hover on node for tooltip (displays title and url).
Single-click on parent nodes that are collapsed (helps condense large graphs)
Right click on nodes to open associated web pages.
Use scroll-wheel to zoom in and out of visualization.
Click on an empty space outside of nodes or edges and hold to drag, or pan the graph side to side

Post-Scraping (Pack Hierarchy Layout) 
Hover on node for tooltip (displays title and url).
Single-click on parent node for zoom to next level. 
Single-click to side of parent node for zoom back to previous level.
Double-click on nodes to open associated web pages.

Search History
Refresh page (this generates the user’s search history)
Select option from dropdown (this automatically populates user inputs with past info)
Click “Clear History” (this deletes the search history corresponding to the user’s cookie)

