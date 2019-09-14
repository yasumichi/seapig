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

window.onload = (e) => {
  const {remote} = require('electron');
  const {app, dialog} = require('electron').remote;
  const ipc = require('electron').ipcRenderer;
  const shell = require('electron').shell;
  const fs = require('fs');
  const path = require('path');
  const storage = require('electron-json-storage');
  const funcs_path = path.join(app.getAppPath(), 'js', 'renderer_funcs.js');
  const {refreshPreview} = require(funcs_path);
  const {showErrorMessage} = require(funcs_path);
  const {openFile, saveFile} = require(funcs_path);

  const webview = document.getElementById('previewer');
  const FIRST_ITEM = 0;

  // Status of document
  var   {docStatus} = require(funcs_path);

  // Initialize ace editor
  const {editor} = require(funcs_path);


  // Emitted whenever the document is changed
  editor.on("change", (event) => {
    docStatus.modified = true;
    ipc.send('doc-modified', docStatus.modified);
    if (event.start.row != event.end.row) {
      refreshPreview(docStatus.filename);
    }
  });

  // Emmited whenever editor is scrolled
  editor.getSession().on("changeScrollTop", (scrollTop) => {
    let height = editor.renderer.scrollBarV.inner.clientHeight;
    if (height) {
      let scrollRatio = scrollTop / height;

      webview.send('scroll', scrollRatio);
    }
  });

  // disable drag and drop to document
  document.ondragover = document.ondrop = (event) => {
    event.preventDefault();

    return false;
  };

  // webview event hook
  webview.addEventListener('dom-ready', () => {
    if (process.env.GUEST_DEBUG) {
      webview.openDevTools();
    }
  });

  webview.addEventListener('new-window', (event) => {
    webview.stop();
    shell.openExternal(event.url);
  });

  // change keybindings
  const keybindings = document.getElementById("keybindings");

  function changeKeyBindings() {
    if (keybindings.value == "default") {
      editor.setKeyboardHandler(null);
    } else {
      editor.setKeyboardHandler(keybindings.value);
    }
    let json = { key_bindings: keybindings.selectedIndex };
    storage.set('key_bindings', json, (error) => {
      if (error) throw error;
    });
    editor.focus();
  }

  keybindings.addEventListener("change", changeKeyBindings);

  // load keybindings
  storage.get('key_bindings', (error, data) => {
    if (error) throw error;

    if (Object.keys(data).length) {
      keybindings.selectedIndex = data.key_bindings;
    } else {
      keybindings.selectedIndex = FIRST_ITEM;
    }
    changeKeyBindings();
  });

  // new file
  const newBtn = document.getElementById("newBtn");
  newBtn.addEventListener("click", () => {
    ipc.send('new-file');
  });

  // open file
  const openBtn = document.getElementById("openBtn");
  openBtn.addEventListener("click", () => {
    let isNewWindow = false;
    if (docStatus.filename) {
      isNewWindow = true;
    } else if (docStatus.modified === true || editor.getValue().length) {
      isNewWindow = true;
    }
    ipc.send('open-file-dialog', docStatus.filename, isNewWindow);
  });

  ipc.on('selected-file', (event, fullpath) => {
    openFile(fullpath[FIRST_ITEM]);
  });

  ipc.on('open-file', (event, fullpath) => {
    openFile(fullpath);
    webview.addEventListener('dom-ready', () => {
      refreshPreview(docStatus.filename);
    });
  });

  // save file
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.addEventListener("click", () => {
    refreshPreview(docStatus.filename);
    if (docStatus.filename == "") {
      ipc.send('save-new-file');
    } else {
      saveFile(docStatus.filename);
    }
  });

  ipc.on('selected-save-file', (event, filename) => {
    saveFile(filename);
  });

  // export html
  const exportHTMLBtn = document.getElementById("exportHTMLBtn");
  exportHTMLBtn.addEventListener("click", () => {
    refreshPreview(docStatus.filename);
    ipc.send('export-HTML', docStatus.filename);
  });

  ipc.on('selected-HTML-file', (event, filename) => {
    webview.send('export-HTML', filename);
    editor.focus();
  });

  // export pdf
  const exportPdfBtn = document.getElementById("exportPdfBtn");
  exportPdfBtn.addEventListener("click", () => {
    refreshPreview(docStatus.filename);
    ipc.send('export-pdf-file', docStatus.filename);
  });

  ipc.on('selected-pdf-file', (event, filename) => {
    webview.printToPDF({}, (error, data) => {
      if (error) {
	showErrorMessage(error);

	return;
      }
      fs.writeFile(filename, data, (write_error) => {
	if (write_error) {
	  showErrorMessage(write_error);

	  return;
	}
      })
    });
    editor.focus();
  });

  /*
   * controle display panes
   */
  const aceEditor = document.getElementById("aceEditor");
  const previewer = document.getElementById("previewer");

  // hide editor
  const hideEditorBtn = document.getElementById("hideEditorBtn");
  hideEditorBtn.addEventListener("click", () => {
    if (aceEditor.hasAttribute("style") == false &&
      previewer.hasAttribute("style") == false) {
      aceEditor.setAttribute("style", "display:none");
      refreshPreview(docStatus.filename);
    } else if (
      aceEditor.hasAttribute("style") == false &&
      previewer.hasAttribute("style") == true) {
      previewer.removeAttribute("style");
      editor.resize(true);
      refreshPreview(docStatus.filename);
    }
  });

  // hide preview
  const HidePreviewBtn = document.getElementById("HidePreviewBtn");
  HidePreviewBtn.addEventListener("click", () => {
    if (aceEditor.hasAttribute("style") == true &&
      previewer.hasAttribute("style") == false) {
      aceEditor.removeAttribute("style");
      editor.resize (true);
      refreshPreview(docStatus.filename);
    } else if (
      aceEditor.hasAttribute("style") == false &&
      previewer.hasAttribute("style") == false) {
      previewer.setAttribute("style", "display:none");
      editor.resize(true);
    }
  });

  // Refresh preview
  const refreshBtn = document.getElementById("refreshBtn");
  refreshBtn.addEventListener("click", () => {
    refreshPreview(docStatus.filename);
    editor.focus();
  });
};
