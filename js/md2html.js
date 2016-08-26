/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Yasumichi Akahoshi
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const marked = require('marked');
const {rendererCode, rendererListitem, rendererHtml} = require('./utils.js');

(function() {

  /**
   * This class is a wrapper of marked.
   * @class
   */
  class Md2Html {

    /**
     * Create a Md2Html
     */
    constructor() {
      this.marked = marked;
      this.renderer = new marked.Renderer();

      this.renderer.code = rendererCode;
      this.renderer.listitem = rendererListitem;
      this.renderer.html = rendererHtml;

      marked.setOptions({
        renderer: this.renderer,
        gfm: true,
        breaks: false
      });
    }

    /**
     * @method
     * @name convert
     * @description convert markdown to html
     * @param {string} markdown - markdown text
     * @return {string} HTML text is converted from markdown
     */
    convert (markdown) {
      return  this.marked(markdown);
    }
  }

  module.exports = Md2Html;

}());
