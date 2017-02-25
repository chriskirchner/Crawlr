# Script: bfs.py
# Description: multithreaded bfs scraper that collects all links starting with single url and sends to server
# Author: Chris Kirchner
# Email: kirchnch@oregonstate.edu

import threading
from bs4 import UnicodeDammit
from queue import Queue
from queue import LifoQueue
import requests
from lxml import html as parser
import lxml
import sys
import json
from time import sleep
from copy import copy


NUM_THREADS = 25

# scraper class for threading
class Scraper(threading.Thread):

    def __init__(self, unvisited, visited, visited_lock, max_levels, keyword):

        # inherit and setup thread variables from input
        super(Scraper, self).__init__()
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
        r = None
        # try to connect to link
        try:
            headers = {'accept': 'text/html'}
            r = requests.get(link.get('url'), timeout=2, headers=headers)
            if r.status_code == 200:
                html = copy(r.content)
            else:
                html = None
        except requests.RequestException as e:
            print(e, file=sys.stderr)
            # only follow OK links that contain html
        finally:
            if r is not None:
                r.close()
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
                print(json.dumps(link))
                if link.get('level') < int(self.max_levels):
                    links = self._getLinks(tree)
                    self._addLinks(links, link)
            # mark task as done for queue.join
            self.unvisited.task_done()


if __name__ == "__main__":

    # get script arguments from server
    start_url = sys.argv[1]
    max_levels = sys.argv[2]
    keyword = sys.argv[3]
    search_type = sys.argv[4]

    # use lock to visited links so only one thread can update at a time
    visited_lock = threading.Lock()
    # make visited links a hashed set so there are not duplicates
    # a bloom filter may improve performance with less memory
    visited_links = set()
    # create a queue of unvisited links added by threads as they scrape
    if search_type == 1:
        # BFS
        unvisited_links = Queue()
    else:
        # DFS
        NUM_THREADS = 1
        unvisited_links = LifoQueue()
    threads = list()

    first_link = dict()
    first_link['url'] = start_url
    first_link['parent'] = None
    first_link['level'] = 0
    # add first link to queue
    unvisited_links.put(first_link)

    # setups and start threads
    for t in range(NUM_THREADS):
        s = Scraper(unvisited_links, visited_links, visited_lock, max_levels, keyword)
        s.daemon = True
        s.start()
        threads.append(s)

    # wait for queue to be empty and all tasks done, then exit
    unvisited_links.join()
