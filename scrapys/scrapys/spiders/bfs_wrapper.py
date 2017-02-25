# https://doc.scrapy.org/en/latest/topics/practices.html
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
import sys, os

os.environ['SCRAPY_SETTINGS_MODULE'] = 'scrapys.settings'
sys.path.append('/home/ev/Capstone_CS467/Crawler/scrapys/')

start_url = sys.argv[1]
max_levels = sys.argv[2]
keyword = sys.argv[3]

process = CrawlerProcess(get_project_settings())
process.settings.set('DEPTH_LIMIT', max_levels)
process.crawl('bfs_scraper', start_url=start_url, keyword=keyword)
process.start()