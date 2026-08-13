const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const script = fs.readFileSync('js/script.js', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();

const dom = new JSDOM(html, { 
    url: 'http://localhost/',
    runScripts: 'dangerously', 
    virtualConsole 
});
try {
  dom.window.eval(script);
  console.log('Success');
} catch (e) {
  console.error(e.name + ': ' + e.message);
  console.error(e.stack);
}
