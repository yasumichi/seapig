/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Yasumichi Akahoshi
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

window.onload = (e) => {
  // Referenced https://github.com/jpzukin/electron-sample-print-to-pdf
  const {ipcRenderer} = require('electron');
  const {app} = require('electron').remote;
  var thisPdfPath;

  const waitImagesComplete = () => {
    var ilist = document.images;
    for(var i = 0; i < ilist.length; i++) {
      if(ilist[i].complete === false) {
        setTimeout(waitImagesComplete, 1000);
        return;
      }
    }
    ipcRenderer.send('ready-print-to-pdf', thisPdfPath);
  }

  ipcRenderer.on('print-to-pdf', (event, contents, baseHref, css, pdfPath) => {
    thisPdfPath = pdfPath;
    let base = document.getElementsByTagName("base")[0];
    base.href = baseHref;

    let link = document.getElementsByTagName("link")[0];
    link.href = css;

    document.body.insertAdjacentHTML('afterbegin' ,contents);

    setTimeout(waitImagesComplete);
  });
}
