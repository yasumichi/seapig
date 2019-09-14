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

const {remote} = require('electron');
const {dialog} = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const fs = require('fs');
const path = require('path');
const webview = document.getElementById('previewer');
const DOCUMENT_START = -1;

// Initialize ace editor
const editor = require('./editor.js');

(function() {

  var docStatus = {
    filename: "",
    modified: false
  };

  module.exports.editor = editor;
  module.exports.docStatus = docStatus;

  /**
   * Show error message dialog
   * @param {string} message - error message
   * @returns {void}
   */
  function showErrorMessage(message) {
    dialog.showMessageBox(
      remote.getCurrentWindow(),
      {
        type: "error",
        title: "SeaPig",
        message: String(message),
        buttons: ["OK"]
      }
    );
  }

  module.exports.showErrorMessage = showErrorMessage;

  /**
   * Refresh preview pane
   * @param {string} currentFile - current file name
   * @returns {void}
   */
  function refreshPreview(currentFile) {
    let baseURI = "";
    if (currentFile != "") {
      baseURI = `file://${path.dirname(currentFile)}/`;
    }
    webview.send('preview', editor.getValue(), baseURI);
  }

  module.exports.refreshPreview = refreshPreview;

  /**
   * Open file to set editor
   * @param {string} fullpath - full path
   * @returns {void}
   */
  module.exports.openFile = (fullpath) => {
    document.title = `SeaPig - [${fullpath}]`;
    fs.readFile(fullpath, (error, text) => {
      if (error !== null) {
        showErrorMessage(error);

        return;
      }
      editor.setValue(text.toString(), DOCUMENT_START);
      docStatus.filename = fullpath;
      docStatus.modified = false;
      ipc.send('doc-modified', docStatus.modified);
      refreshPreview(fullpath);
    });
    editor.focus();
  }

  /**
   * Save file from editor
   * @param {string} filename - full path
   * @returns {void}
   */
  module.exports.saveFile = (filename) => {
    fs.writeFile (filename, editor.getValue(), (error) => {
      if (error !== null) {
        showErrorMessage(error);

        return;
      }
      document.title = `SeaPig - [${filename}]`;
      docStatus.modified = false;
      ipc.send('doc-modified', docStatus.modified);
      docStatus.filename = filename;
      docStatus.modified = false;
      editor.focus();
    });
  }

}());
