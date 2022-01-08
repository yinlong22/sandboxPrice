const cheerio = require('cheerio');
const http = require('http')
const superagent = require('superagent');
const qs = require("querystring");
const server = http.createServer()
server.listen(8808)

let hotNews = [];

superagent.get('https://news.baidu.com/').end((err, res) => {
    if (err) {
        console.log(`热点新闻抓取失败 - ${err}`)
    } else {
        hotNews = getHotNews(res)
    }
});
const getHotNews = (res) => {
    let $ = cheerio.load(res.text);
    $('div#pane-news ul li a').each((idx, ele) => {
        // cherrio中$('selector').each()用来遍历所有匹配到的DOM元素
        // 参数idx是当前遍历的元素的索引，ele就是当前便利的DOM元素
        let news = {
            title: $(ele).text(),        // 获取新闻标题
            href: $(ele).attr('href'),    // 获取新闻网页链接
        };
        hotNews.push(news)              // 存入最终结果数组
    });
    return hotNews
};

server.on('request', function (req, res) {
    const url = req.url
    const path = url.substr(0, url.indexOf('?'))
    const queryStr = url.substr(url.indexOf('?') + 1, url.length)
    const query = qs.parse(queryStr)
    switch (path) {
        case '/index':
            switch (req.method) {
                case 'GET':
                    res.statusCode = 200
                    res.end(JSON.stringify(hotNews))
                    break
                case 'POST':
                    break
                default:
                    res.statusCode = 404
                    res.end('METHOD_FAIL')
                    break
            }
            break
        default:
            res.statusCode = 404
            res.end('NOT_FOUND')
            break
    }
})
