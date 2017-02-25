# Script: bfs.py
# Description: multithreaded bfs scraper that collects all links starting with single url and sends to server
# Author: Chris Kirchner
# Email: kirchnch@oregonstate.edu

import scrapy
import sys
from scrapy.linkextractors import LinkExtractor
import json

# modify settings in program
# http://stackoverflow.com/questions/33094306/being-able-to-change-the-settings-while-running-scrapy-from-a-script


class BfsScraper(scrapy.Spider):
    name = "bfs_scraper"

    def __init__(self, **kwargs):

        super(BfsScraper, self).__init__()
        self.start_urls = [kwargs.get('start_url')]
        self.keyword = kwargs.get('keyword')
        self.link_extractor = LinkExtractor()

    def parse(self, response):
        # NEED TO PARSE TEXT FOR KEYWORD
        # print link to GFX
        link = dict(
            title=response.css('title::text').extract_first(),
            url=response.url,
            parent_url=response.meta.get('parent', None)
        )
        print(json.dumps(link))
        links = self.link_extractor.extract_links(response)
        for link in links:
            yield scrapy.Request(link.url, callback=self.parse, meta={'parent': response.url})



