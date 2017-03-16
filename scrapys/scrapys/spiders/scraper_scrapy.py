# Script: bfs.py
# Description: asynchronous parallel request scraper for dfs or bfs using high level library
# (it's almost like cheating)
# Author: Chris Kirchner
# Email: kirchnch@oregonstate.edu

import scrapy
import sys
from scrapy.linkextractors import LinkExtractor
import json

# modify settings in program
# http://stackoverflow.com/questions/33094306/being-able-to-change-the-settings-while-running-scrapy-from-a-script

class BfsScraper(scrapy.Spider):
    name = "scraper_scrapy"

    def __init__(self, **kwargs):

        # setup class variables
        super(BfsScraper, self).__init__()
        self.start_urls = [kwargs.get('start_url')]
        self.keyword = kwargs.get('keyword')
        self.link_extractor = LinkExtractor()

    def parse(self, response):
        # get text in html
        text = ''.join(response.selector.xpath('string()').extract())
        keyword = False
        # see if keyword is in text
        if self.keyword != '' and self.keyword in text:
            keyword = True
        # construct json output
        link = dict(
            title=response.css('title::text').extract_first(),
            url=response.url,
            parent_url=response.meta.get('parent', None),
            keyword=keyword
        )
        # send site to GFX
        print(json.dumps(link))
        # get all links connected to site
        links = self.link_extractor.extract_links(response)
        # follow each link up to the depth specified to middlware
        for link in links:
            yield scrapy.Request(link.url, callback=self.parse, meta={'parent': response.url})



