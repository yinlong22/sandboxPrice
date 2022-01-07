const express = require('express');
const app = express();
const cheerio = require('cheerio');

const server = app.listen(3000, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log('Your App is running at https://%s:%s', host, port);
});

// 引入所需要的第三方包
const superagent = require('superagent');

let hotNews = [];

superagent.get('https://news.baidu.com/').end((err, res) => {
  if (err) {
    console.log(`热点新闻抓取失败 - ${err}`)
  } else {
    hotNews = getHotNews(res)
  }
});

let getHotNews = (res) => {
  // 访问成功，请求http://news.baidu.com/页面所返回的数据会包含在res.text中。
  /* 使用cheerio模块的cherrio.load()方法，将HTMLdocument作为参数传入函数
     以后就可以使用类似jQuery的$(selectior)的方式来获取页面元素
   */
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

app.get('/', async (req, res) => {
  res.send(hotNews);
});
