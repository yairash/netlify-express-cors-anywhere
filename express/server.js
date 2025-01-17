const express = require('express');
const serverless = require('serverless-http');

const app = express();


const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const urlToFetch = req.query.externalUrl;
    await savePage(urlToFetch);
    fs.readFile('currentDom.html', 'utf8', (err, fileContent) => {
      if (err) {
        res.write("Error with reading currentDom.html");
        res.writeHead(500, {});
      } else {
        res.write(fileContent);
        res.writeHead(200, {});
      }
    });
  }
  catch (error) {
    res.write("no externalurl provided");
    res.writeHead(200, {});
  }
});

async function savePage(url) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const domContent = await page.content();
  fs.writeFileSync('currentDom.html', domContent);

  await browser.close();
};

app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
