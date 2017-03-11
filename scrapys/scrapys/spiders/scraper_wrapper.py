# https://doc.scrapy.org/en/latest/topics/practices.html
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
import sys, os

os.environ['SCRAPY_SETTINGS_MODULE'] = 'scrapys.settings'
sys.path.append(os.path.join(os.getcwd(), 'scrapys'))

start_url = sys.argv[1]
max_levels = sys.argv[2]
keyword = sys.argv[3]
search_type = sys.argv[4]

process = CrawlerProcess(get_project_settings())
process.settings.set('DEPTH_LIMIT', max_levels)

# if int(search_type) == 0:
#     # DFS
#     process.settings.set('DEPTH_PRIORITY', 0)
# elif int(search_type) == 1:
#     # BFS
#     process.settings.set('DEPTH_PRIORITY', 1)

process.crawl('scraper_scrapy', start_url=start_url, keyword=keyword)
process.start()