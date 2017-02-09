import threading
from bs4 import UnicodeDammit
from queue import Queue
import requests
from lxml import html
import sys
import json
from time import sleep

NUM_THREADS = 50

class Scraper(threading.Thread):

    def __init__(self, unvisited, visited, visited_lock, max_levels, keyword):

        super(Scraper, self).__init__()
        self.unvisited = unvisited
        self.visited = visited
        self.visited_lock = visited_lock
        self.max_levels = max_levels
        self.keyword = keyword

    def _getLink(self):

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
        anchors = tree.cssselect("a")
        links = list()
        for a in anchors:
            links.append(a.get('href'))
        return links

    def _findKeyword(self, tree):
        if self.keyword in tree.xpath("string()"):
            return True
        return False

    def run(self):
        while True:
            link = self._getLink()
            if link is not None:
                r = requests.get(link.get('url'))
                if r.status_code == 200:
                    damn_html = UnicodeDammit(r.content)
                    tree = html.fromstring(damn_html.unicode_markup)
                    tree.make_links_absolute(link.get('url'))
                    link['keyword'] = False
                    if len(self.keyword) != 0 and self._findKeyword(tree):
                        # trigger script interrupt with keyword
                        link['keyword'] = True
                    print(json.dumps(link))
                    if link.get('level') < int(self.max_levels):
                        links = self._getLinks(tree)
                        self._addLinks(links, link)
            self.unvisited.task_done()


if __name__ == "__main__":

    start_url = sys.argv[1]
    max_levels = sys.argv[2]
    keyword = sys.argv[3]


    visited_lock = threading.RLock()
    visited_links = set()
    unvisited_links = Queue()
    threads = list()

    first_link = dict()
    first_link['url'] = start_url
    first_link['parent'] = None
    first_link['level'] = 0
    unvisited_links.put(first_link)

    for t in range(NUM_THREADS):
        s = Scraper(unvisited_links, visited_links, visited_lock, max_levels, keyword)
        s.daemon = True
        s.start()
        threads.append(s)

    # wait for queue to be empty and all tasks done
    unvisited_links.join()
