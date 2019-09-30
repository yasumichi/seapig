/* for mermaid */
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
global.window = window;
global.SVGElement = window.SVGElement;

var assert = require('assert');
const marked = require('marked');
const Md2Html = require('../js/md2html.js');
var md2html = new Md2Html();

describe('convert markdown', () => {
  it('convert normal syntax', () => {
    const header = "# Title";
    const list   = "- test";
    const inlinecode = "`<html>`";

    assert(md2html.convert(header) === marked(header));
    assert(md2html.convert(list) === marked(list));
    assert(md2html.convert(inlinecode) === marked(inlinecode));
  });

  it('convert multi byte heading', () => {
    const header = "# 漢字の題名";
    const expect = '<h1 id="e6bca2e5ad97e381aee9a18ce5908d">漢字の題名</h1>\n';

    assert(md2html.convert(header) === expect);
  });

  it('convert paragraph', () => {
    const markdown = "This is paragraph.";
    const expect = "<p>This is paragraph.</p>\n";

    assert(md2html.convert(markdown) === expect);
  });

  it('convert paragraph contains webview tag(test sanitize)', () => {
    const markdown = 'This is paragraph.<webview preload="evil.js"></webview>This is contains webview.';
    const expect = "<p>This is paragraph.This is contains webview.</p>\n";

    assert(md2html.convert(markdown) === expect);
  });
});
