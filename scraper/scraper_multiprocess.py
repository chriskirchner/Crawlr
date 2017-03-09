# Script: bfs.py
# Description: multithreaded bfs scraper that collects all links starting with single url and sends to server
# Author: Chris Kirchner
# Email: kirchnch@oregonstate.edu

import multiprocessing
from bs4 import UnicodeDammit
from queue import Queue
import requests
from lxml import html as parser
import lxml
import sys
import json
from time import sleep
from pympler import muppy
from sys import getsizeof
import os
import psutil
from pympler import asizeof

NUM_THREADS = 25

# scraper class for threading
class Scraper():

    def __init__(self, unvisited, visited, visited_lock, max_levels, keyword):

        # inherit and setup thread variables from input
        self.unvisited = unvisited
        self.visited = visited
        self.visited_lock = visited_lock
        self.max_levels = max_levels
        self.keyword = keyword


    def _getLink(self):

        """
        getLink: returns link from queue
        :return: link
        """
        link = None
        visited = True
        while visited:
            link = self.unvisited.get()
            with self.visited_lock:
                if link.get('url') not in self.visited:
                    visited = False
                    self.visited.add(link.get('url'))
        return link

    def _addLinks(self, hrefs, parent):

        """
        addLinks: adds scrapped links to queue
        :param hrefs: scrapped links
        :param parent: parent link
        """
        level = parent.get('level')+1
        links = list()
        parent['parent'] = None
        for href in hrefs:
            new_link = dict()
            new_link['url'] = href
            new_link['level'] = level
            new_link['parent'] = parent
            links.append(new_link)

        for link in links:
            self.unvisited.put(link)


    def _getLinks(self, tree):
        """
        getLinks: returns links from lxml tree
        :param tree: lxml tree built from html
        :return: found links
        """
        # anchors = tree.cssselect("a")
        anchors = tree.xpath("//a")
        links = list()
        for a in anchors:
            links.append(a.get('href'))
        return links

    def _findKeyword(self, tree):
        """
        findKeyword: searches for keyword in displayable text from html
        :param tree:
        :return:
        """
        if self.keyword in tree.xpath("string()"):
            return True
        return False

    def _getHtml(self, link):
        html = None
        # try to connect to link
        try:
            s = requests.Session()
            r = s.head(link.get('url'), timeout=1)
            content_type = r.headers.get('content-type', None)
            if content_type is None or content_type.split(';')[0] == 'text/html':
                r = s.get(link.get('url'), timeout=1)
                s.close()
            if r.status_code == 200:
                    html = r.content
            else:
                html = None
            r.close()
        except requests.RequestException as e:
            print(e, file=sys.stderr)
            # only follow OK links that contain html
        finally:
            return html

    def _getTree(self, html, base_url):
        # try to build lxml tree with unicoded html
        tree = None
        try:
            # convert possibly bad html to unicode
            damn_html = UnicodeDammit(html)
            # convert html into lxml tree
            tree = parser.fromstring(damn_html.unicode_markup)
            # make all links absolute based on url
            tree.make_links_absolute(base_url)
        except Exception as e:
            print(e, file=sys.stderr)
        finally:
            return tree

    def run(self):
        """
        override threading run function
        """
        while True:
            # gets link from queue
            link = self._getLink()
            html = None
            if link is not None:
                html = self._getHtml(link)
            tree = None
            if html is not None:
                tree = self._getTree(html, link.get('url'))
            if tree is not None:
                # search for keyword in html text
                link['keyword'] = False
                if len(self.keyword) != 0 and self._findKeyword(tree):
                    # trigger script interrupt with keyword
                    link['keyword'] = True
                # send link to server through stdout
                # print(json.dumps(link))
                if link.get('level') < int(self.max_levels):
                    links = self._getLinks(tree)
                    self._addLinks(links, link)
            # mark task as done for queue.join
            self.unvisited.task_done()


if __name__ == "__main__":

    # get script arguments from server
    # start_url = sys.argv[1]
    # max_levels = sys.argv[2]
    # keyword = sys.argv[3]

    start_url = "https://www.google.com"
    keyword = ''
    max_levels = 2
    visited_lock = multiprocessing.Lock()
    visited = set()
    unvisited = multiprocessing.JoinableQueue()

    first_link = dict()
    first_link['url'] = start_url
    first_link['parent'] = None
    first_link['level'] = 0

    unvisited.put(first_link)

    pool = multiprocessing.Pool(25, Scraper(unvisited, visited, visited_lock, max_levels, keyword).run)
    #
    while True:
        sleep(1)
        p = psutil.Process(os.getpid())
        mem = 0
        for c in p.children():
            # mem += c.memory_maps.get('rss');

    unvisited.join()





    # # add first link to queue
    # unvisited_links.put(first_link)
    #
    # # setups and start threads
    # for t in range(NUM_THREADS):
    #     s = Scraper(unvisited_links, visited_links, visited_lock, max_levels, keyword)
    #     s.daemon = True
    #     s.start()
    #     threads.append(s)
    #
    # # wait for queue to be empty and all tasks done, then exit
    # unvisited_links.join()

