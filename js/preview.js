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

(function() {

  window.onload = function () {
    const {remote} = require('electron');
    const {dialog} = require('electron').remote;
    const {ipcRenderer} = require('electron');
    const fs = require('fs');
    const path = require('path');
    const Md2Html = require('./md2html.js');
    const FIRST_IDX = 0;
    const NO_SCROLL = 0;

    /**
     * @module js/preview.js
     */

    var md2html = new Md2Html();

    /**
     * Get contents of first h1
     * @returns {string} contents of first h1
     */
    function getContentsOfFirstH1 () {
      let h1List = document.getElementsByTagName("h1");
      if (h1List.length) {
        return  h1List[FIRST_IDX].innerHTML
          .replace(/<a [^>]*>/g, '')
          .replace(/<\/a>/g, '')
          .replace(/\n/g, '');
      }

      return  '';
    }

    /**
     * Set document title
     * @returns {title} setted title
     */
    function setDocumentTitle () {
      let workTitle = getContentsOfFirstH1();
      if (/^(<img [^>]*>\s*)+$/.test(workTitle)) {
        let alts = workTitle.match(/ alt="[^"]*"/gi);
        if (alts) {
          document.title =
            alts[FIRST_IDX].trim()
            .replace(/alt=/i, '')
            .replace(/"/g, '');
        }
      } else {
        document.title = workTitle.replace(/<[^>]*>/g, "").trim();
      }

      return  document.title;
    }


    /**
     * Refresh preview
     * @param {object} event
     * @param {string} data - markdown text
     * @param {string} baseURI
     * @listens preview
     */
    ipcRenderer.on('preview', (event, data, baseURI) => {
      let base = document.getElementsByTagName("base")[FIRST_IDX];
      if (baseURI != "") {
        base.setAttribute("href", baseURI);
      }
      base.setAttribute("target", "_blank");
      document.getElementById('body').innerHTML = md2html.convert(data);
      setDocumentTitle();
    });

    /**
     * Export HTML
     * @param {object} event
     * @param {string} filename - exported HTML file name
     * @listen export-HTML
     */
    ipcRenderer.on('export-HTML', (event, filename) => {
      let base = document.getElementsByTagName("base")[FIRST_IDX];
      base.removeAttribute("href");
      base.removeAttribute("target");

      // http://blog.mudatobunka.org/entry/2015/12/23/211425#postscript
      fs.writeFile (filename, new XMLSerializer().serializeToString(document),
        (error) => {
          if (error !== null) {
            dialog.showMessageBox(
              remote.getCurrentWindow(),
              {
                type: "error",
                title: "SeaPig",
                message: `${error}`,
                buttons: ["OK"]
              }
            );

            return;
          }
          let src_css = path.join(__dirname, '../templates/github.css');
          let dest_css = path.join(path.dirname(filename), "github.css");
          fs.createReadStream(src_css).pipe(fs.createWriteStream(dest_css));
        });

      base.setAttribute("target", "_blank");
    });

    /**
     * Scroll
     * @param {object} event
     * @param {number} scrollRatio
     * @returns {void}
     */
    ipcRenderer.on('scroll', (event, scrollRatio) => {
      let scrollTop = document.body.clientHeight * scrollRatio;
      window.scrollTo(NO_SCROLL, scrollTop);
    });
  }

}());
