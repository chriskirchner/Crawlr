# Web Crawler

<div style="position:relative;height:0;padding-bottom:75.0%"><iframe src="https://www.youtube.com/embed/yHv8RUs1N2c?ecver=2" width="480" height="360" frameborder="0" allow="autoplay; encrypted-media" style="position:absolute;width:100%;height:100%;left:0" allowfullscreen></iframe></div>


## Overview


## Website Link
[Web Crawler](http://159.89.136.195:8080/)

## SETUP on Ubuntu (requires sudo):

```chmod +x setup
./setup
node index.js
```

## User Instructions

#### Start Scraping
1. Go [here](http://159.89.136.195:8080/)
2. Input a starting URL. (e.g., http://www.sciencekids.co.nz/sciencefacts/animals/cat.html)
3. <OPTIONAL> Input the desired keyword (the scraper will halt on discovery).
4. Input the number of levels to traverse (must be greater than 0).
5. Select a search type (BFS, DFS, or Single-Path DFS)
6. <OPTIONAL> Specify the desired scraper (HTML, JS, or Scrapy)
7. We suggest testing on HTML or Scrapy first since JS has had some memory issues
8. Click “Crawl” (Graph will generate).

#### Post-Scraping (Force Layout) 
1. Hover on node for tooltip (displays title and url).
2. Single-click on parent nodes that are collapsed (helps condense large graphs)
3. Right click on nodes to open associated web pages.
4. Use scroll-wheel to zoom in and out of visualization.
5. Click on an empty space outside of nodes or edges and hold to drag, or pan the graph side to side

#### Post-Scraping (Pack Hierarchy Layout) 
1. Hover on node for tooltip (displays title and url).
2. Single-click on parent node for zoom to next level. 
3. Single-click to side of parent node for zoom back to previous level.
4. Double-click on nodes to open associated web pages.

#### Search History
1. Refresh page (this generates the user’s search history)
2. Select option from dropdown (this automatically populates user inputs with past info)
3. Click “Clear History” (this deletes the search history corresponding to the user’s cookie)

## Credits
- Chris Kirchner
- Christiano Vannellic
- Himal Patel