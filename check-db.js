const fs = require('fs');
const url = require('url');

const lines = fs.readFileSync('.env', 'utf8').split('\n');
lines.forEach(l => {
  if (l.startsWith('DATABASE_URL=')) {
    try {
      const dbUrl = new url.URL(l.split('=')[1].replace(/"/g, '').trim());
      console.log('DATABASE_URL Host:', dbUrl.host);
      console.log('DATABASE_URL Port:', dbUrl.port);
      console.log('DATABASE_URL Params:', dbUrl.search);
    } catch(e) {}
  }
  if (l.startsWith('DIRECT_URL=')) {
    try {
      const dUrl = new url.URL(l.split('=')[1].replace(/"/g, '').trim());
      console.log('DIRECT_URL Host:', dUrl.host);
      console.log('DIRECT_URL Port:', dUrl.port);
    } catch(e) {}
  }
});
