const html = require('fs').readFileSync('index.html', 'utf8');
const script = require('fs').readFileSync('js/script.js', 'utf8');
const jsdom = require('jsdom');
const dom = new jsdom.JSDOM(html);
const doc = dom.window.document;

const regex = /document\.getElementById\('([^']+)'\)/g;
let match;
while ((match = regex.exec(script)) !== null) {
  const id = match[1];
  if (!doc.getElementById(id)) {
    console.log('Missing DOM ID:', id);
  }
}
console.log('Done');
