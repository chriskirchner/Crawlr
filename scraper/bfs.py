# Script: bfs.py
# Description: multithreaded bfs scraper that collects all links starting with single url and sends to server
# Author: Chris Kirchner
# Email: kirchnch@oregonstate.edu

import threading
from random import random
from time import sleep

from bs4 import UnicodeDammit
import requests
from lxml import html as parser
import sys
import json
from contextlib import closing
import multiprocessing
from multiprocessing import JoinableQueue
from multiprocessing import Queue
import signal
import gc
import os
import pickle
from queuelib import FifoDiskQueue
from queuelib import LifoDiskQueue
import shutil

NUM_THREADS = 100
MAX_DOWNLOAD_SIZE = 500000
BUFFER_FILE = os.path.join(os.getcwd(), 'tmp')
MAX_REQUEST_DELAY = 2

# scraper class for threading
class Parser:

    def __init__(self, html_queue, link_queue, visited, lock, max_levels, keyword):

        # inherit and setup thread variables from input
        self.html_queue = html_queue
        self.link_queue = link_queue
        self.max_levels = max_levels
        self.visited = visited
        self.visited_lock = lock
        self.keyword = keyword

    def _addLinks(self, hrefs, parent):

        """
        addLinks: adds scrapped links to queue
        :param hrefs: scrapped links
        :param parent: parent link
        """
        level = parent.get('level')+1
        for href in hrefs:
            link = dict()
            link['url'] = href
            link['level'] = level
            link['parent_url'] = parent['url']
            if link['url'] not in self.visited:
                self.link_queue.put(link)
                with self.visited_lock:
                    self.visited.add("{}".format(link['url']))

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

    def _getTree(self, base_url, html):
        # try to build lxml tree with unicoded html
        tree = None
        try:
            # convert possibly bad html to unicode
            damn_html = UnicodeDammit(html)
            # convert html into lxml tree
            tree = parser.fromstring(damn_html.unicode_markup)
            del damn_html
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
            (link, html) = self.html_queue.get()
            tree = None
            if html is not None:
                tree = self._getTree(link['url'], html)
            if tree is not None:
                # search for keyword in html text
                link['keyword'] = False
                if len(self.keyword) != 0 and self._findKeyword(tree):
                    # trigger script interrupt with keyword
                    link['keyword'] = True
                # send link to server through stdout
                print(json.dumps(link))
                if link['level'] < int(self.max_levels):
                    links = self._getLinks(tree)
                    del tree
                    self._addLinks(links, link)
            del link
            # mark task as done for queue.join
            # gc.collect()

class Scraper(threading.Thread):

    def __init__(self, html_queue, link_queue, lock):

        # inherit and setup thread variables from input
        super(Scraper, self).__init__()
        self.html_queue = html_queue
        self.link_queue = link_queue
        self.lock = lock

    def _getHtml(self, link):
        html = None

        # try to connect to link
        try:
            headers = {'accept': 'text/html'}
            with closing(requests.get(link.get('url'), timeout=1, headers=headers, stream=True)) as r:
                if r.status_code == 200 \
                        and int(r.headers.get('content-length', 0)) < MAX_DOWNLOAD_SIZE \
                        and (r.headers.get('content-type', None).split(';')[0] == 'text/html'
                             or r.headers.get('content-type', None) is None):
                    # http://stackoverflow.com/questions/16694907/how-to-download-large-file-in-python-with-requests-py
                    it = r.iter_content(chunk_size=1024)
                    html = "{}".format(it.__next__())
                    if "<html" in html:
                        for chunk in r.iter_content(chunk_size=1024):
                            html = "{}{}".format(html, chunk)
                    else:
                        html = None
                else:
                    html = None
        except requests.RequestException as e:
            print(e, file=sys.stderr)
        finally:
            # only follow OK links that contain html
            return html

        # url = "{}".format(link['url'])
        # p = Popen(["curl", url], stdout=PIPE)
        # html = p.communicate()[0]

    def run(self):
        """
        override threading run function
        """
        while True:
            # gets link from queue

            # link = self.link_queue.get()
            link = None
            html = None
            with self.lock:
                pop = None
                try:
                    pop = self.link_queue.pop()
                except ValueError as e:
                    pass
                if pop is not None and len(pop) > 4:
                    link = pickle.loads(pop)
            if link is not None:
                html = self._getHtml(link)
                if html is not None:
                    self.html_queue.put((link, html))
                    # scraper is too fast - causes timeouts
            sleep(random()*MAX_REQUEST_DELAY)
                #     del html
                # del link
            # gc.collect()

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


    if os.path.isdir(BUFFER_FILE):
        shutil.rmtree(BUFFER_FILE)
    elif os.path.isfile(BUFFER_FILE):
        os.remove(BUFFER_FILE)

    if int(search_type) == 1:
        # BFS / DIR
        disk_buffer = FifoDiskQueue(BUFFER_FILE)
    else:
        # DFS / FILE
        disk_buffer = LifoDiskQueue(BUFFER_FILE)

    unvisited_links_in = Queue()
    unvisited_links_out = Queue()
    unparsed_html = JoinableQueue()
    buffer_lock = threading.Lock()




    first_link = dict()
    first_link['url'] = start_url
    first_link['parent_url'] = None
    first_link['level'] = 0
    # add first link to queue
    disk_buffer.push(pickle.dumps(first_link))

    # setups and start threads
    threads = list()
    for t in range(NUM_THREADS):
        s = Scraper(unparsed_html, disk_buffer, buffer_lock)
        s.daemon = True
        s.start()
        threads.append(s)

    pool = multiprocessing \
        .Pool(1, Parser(unparsed_html, unvisited_links_out, visited_links, visited_lock, max_levels, keyword)
              .run)


    def signal_handler(signal, frame):
        with buffer_lock:
            disk_buffer.close()
        if int(search_type) == 1:
            # BFS / DIR
            if os.path.exists(BUFFER_FILE):
                shutil.rmtree(BUFFER_FILE)
        else:
            # DFS / FILE
            if os.path.exists(BUFFER_FILE):
                os.remove(BUFFER_FILE)
        pool.terminate()
        pool.join()
        exit()

    signal.signal(signal.SIGTERM, signal_handler)



    while True:
        # for _ in range(unvisited_links_out.qsize()):
        with buffer_lock:
            for _ in range(unvisited_links_out.qsize()):
                disk_buffer.push(pickle.dumps(unvisited_links_out.get()))
            # for noe
        sleep(0.01)

        # if unvisited_links_in.qsize() <= 0:
        #     pop = disk_buffer.pop()
        #     if pop is not None and len(pop) > 1:
        #         unvisited_links_in.put(pickle.loads(pop))

    # wait for queue to be empty and all tasks done, then exit
    # unvisited_links_in.join()


