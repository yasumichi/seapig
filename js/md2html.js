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
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function() {
  "use strict";

  const marked = require('marked');
  const hljs = require('highlight.js');
  const Viz = require("viz.js");
  const uiflow = require("uiflow");
  const escapeHtml = require('./utils.js');

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

      /**
       * customize to render code
       * @param {string} code - contents of code block
       * @param {string} language - program language of code block
       */
      this.renderer.code = function (code, language) {
        const CONV_ERR_HEAD = "\n******************* Convert Error *******************\n";
        const CONV_ERR_TAIL = "*****************************************************\n";
        if (language == "graphviz") {
          let result;
          try {
            result = Viz(code);
            return result;
          } catch (error) {
            return '<pre><code>' + hljs.highlightAuto(code).value + CONV_ERR_HEAD + error + CONV_ERR_TAIL +'</code></pre>';
          }
        } else if(language == "uiflow") {
          try {
            let dot = uiflow.compile(code);
            return Viz(dot);
          } catch (error) {
            console.log(error);
            return '<pre><code>' + escapeHtml(code) + CONV_ERR_HEAD + error + '\n' + CONV_ERR_TAIL +'</code></pre>';
          }
        } else {
          return '<pre><code>' + hljs.highlightAuto(code).value + '</code></pre>';
        }
      }

      /**
       * customize to render list item
       * @param {string} text - contents of list item
       */
      this.renderer.listitem =  function (text) {
        if (text.startsWith("[x]")) {
          return '<li class="task-list-item"><input type="checkbox" checked="true" disabled="true">' + text.slice(3) + '</li>';
        } else if (text.startsWith("[ ]")) {
          return '<li class="task-list-item"><input type="checkbox" disabled="true">' + text.slice(3) + '</li>';
        } else {
          return '<li>' + text + '</li>';
        }
      }

      /**
       * customize to render HTML (sanitize script)
       * @param {string} html - contents of html code block
       */
      this.renderer.html = function (html) {
        if (html.match(/<[^>]*script[^>]*>/g) !== null) {
          return '<pre><code>' + escapeHtml(html).trim() + '</code></pre>';
        } else if (html.match(/<[^>]* on[^=>]*=/) !== null) {
          return '<pre><code>' + escapeHtml(html).trim() + '</code></pre>';
        } else {
          return html;
        }
      }

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

})();
