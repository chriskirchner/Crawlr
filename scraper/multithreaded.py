import threading
from queue import Queue
import requests
from lxml import html
import sys
import json

NUM_THREADS = 500

class Scraper(threading.Thread):

    def __init__(self, unvisited, visited, visited_lock, max_level):

        super(Scraper, self).__init__()
        self.unvisited = unvisited
        self.visited = visited
        self.visited_lock = visited_lock
        self.max_level = max_level

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

    def run(self):
        while True:
            link = self._getLink()
            if link is not None:
                r = requests.get(link.get('url'))
                if r.status_code == 200:
                    print(json.dumps(link))
                    tree = html.fromstring(r.content)
                    tree.make_links_absolute(link.get('url'))

                    if link.get('level') < max_level:
                        anchors = tree.cssselect("a")
                        hrefs = list()
                        for a in anchors:
                            hrefs.append(a.get('href'))
                        self._addLinks(hrefs, link)
            self.unvisited.task_done()


if __name__ == "__main__":

    start_url = "http://www.google.com"

    visited_lock = threading.RLock()
    visited_links = set()
    unvisited_links = Queue()
    threads = list()

    first_link = dict()
    first_link['url'] = start_url
    first_link['parent'] = None
    first_link['level'] = 0
    unvisited_links.put(first_link)

    max_level = 2
    for t in range(NUM_THREADS):
        s = Scraper(unvisited_links, visited_links, visited_lock, max_level)
        s.daemon = True
        s.start()
        threads.append(s)

    # wait for queue to be empty and all tasks done
    unvisited_links.join()
