/* for mermaid */
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
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
    const expect = '<h1 id="E6BCA2E5AD97E381AEE9A18CE5908D">漢字の題名</h1>\n';

    assert(md2html.convert(header) === expect);
  });

  it('convert complete task', () => {
    assert(md2html.convert("- [x] Complete task") ===
      '<ul>\n<li class="task-list-item"><input type="checkbox" checked="true" disabled="true">Complete task</li></ul>\n'
    );
  });

  it('convert uncomplete task', () => {
    assert(md2html.convert("- [ ] Uncomplete task") ===
      '<ul>\n<li class="task-list-item"><input type="checkbox" disabled="true">Uncomplete task</li></ul>\n'
    );
  });
});
