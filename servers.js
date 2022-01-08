const cheerio = require('cheerio');
const http = require('http')
const superagent = require('superagent');
// const qs = require("querystring");
const server = http.createServer()
const fs = require('fs')
server.listen(8808)

let users = []
let hotNews = [];
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
const getSandBoxPrice = async () => {
    await superagent.get('https://news.baidu.com/').end((err, res) => {
        if (err) {
            console.log(`热点新闻抓取失败 - ${err}`)
        } else {
            hotNews = getHotNews(res)
        }
    });
}
getSandBoxPrice().then()

server.on('request', function (req, res) {
    const url = req.url
    const path = url.substr(0, url.indexOf('?'))
    // ?后字段的处理
    // const queryStr = url.substr(url.indexOf('?') + 1, url.length)
    // const query = qs.parse(queryStr)
    switch (path) {
        case '/index':
            switch (req.method) {
                case 'GET':
                    res.statusCode = 200
                    getSandBoxPrice().then(() => {
                        res.end(JSON.stringify(hotNews))
                    })
                    break
                case 'POST':
                    // 普通形式req
                    // let reqBodyStr
                    // const contentType= req.headers['content-type']
                    // if (contentType!=='application/json'){
                    //     res.statusCode = 400
                    //     res.end('typeError')
                    // }
                    // req.on("data", function (data) {
                    //     reqBodyStr += data
                    // })
                    // req.on("end", function (data) {
                    //     const user = qs.parse(reqBodyStr)
                    //     users.push(user)
                    //     res.statusCode = 200
                    //     res.end(JSON.stringify(user))
                    // })
                    // 流形式
                    break
                default:
                    res.statusCode = 404
                    res.end('METHOD_FAIL')
                    break
            }
            break
        case '/demo.html':
            res.statusCode=200
            fs.createReadStream('./demo.html').pipe(res)
            break
        default:
            res.statusCode = 404
            res.end('NOT_FOUND')
            break
    }
})
