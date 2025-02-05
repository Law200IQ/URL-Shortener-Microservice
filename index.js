require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');

const app = express();
const port = process.env.PORT || 3000;

// Basic Configuration
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// In-memory storage for URLs
const urls = new Map();
let counter = 1;

// Routes
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// URL Shortener API endpoint
app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;
  
  // Extract hostname for DNS lookup
  let urlObject;
  try {
    urlObject = new URL(url);
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
  
  dns.lookup(urlObject.hostname, (err, address) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    
    // Check if URL already exists
    for (let [shortUrl, originalUrl] of urls.entries()) {
      if (originalUrl === url) {
        return res.json({
          original_url: originalUrl,
          short_url: shortUrl
        });
      }
    }
    
    // Create new short URL
    urls.set(counter, url);
    res.json({
      original_url: url,
      short_url: counter
    });
    counter++;
  });
});

// Redirect endpoint
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const url = urls.get(shortUrl);
  
  if (url) {
    res.redirect(url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
}); 