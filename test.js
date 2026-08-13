const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const script = fs.readFileSync('js/script.js', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on('error', (err) => {
  console.error('JSDOM Error:', err.message);
  if (err.detail) console.error('Details:', err.detail);
});
virtualConsole.on('warn', (warn) => {
  console.warn('JSDOM Warn:', warn);
});
virtualConsole.on('info', (info) => {
  console.info('JSDOM Info:', info);
});
virtualConsole.on('log', (log) => {
  console.log('JSDOM Log:', log);
});

const dom = new JSDOM(html, { runScripts: 'dangerously', virtualConsole });
try {
  dom.window.eval(script);
  console.log('Script executed successfully in JSDOM');
} catch (e) {
  console.error('Exception thrown during eval:', e);
}
