const {dialog} = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const shell = require('electron').shell;
const webview = document.getElementById('previewer');
const fs = require('fs');
const path = require('path');
const storage = require('electron-json-storage');
const FIRST_ITEM = 0;

// Status of document
var currentFile = "";
var modified = false;

// Initialize ace editor
require('ace-min-noconflict');
require('ace-min-noconflict/theme-twilight');
require('ace-min-noconflict/mode-markdown');
require('ace-min-noconflict/keybinding-emacs');
require('ace-min-noconflict/keybinding-vim');
var editor = ace.edit("aceEditor");
editor.setTheme("ace/theme/twilight");
editor.getSession().setMode("ace/mode/markdown");
editor.getSession().setUseWrapMode(true);
editor.focus();
// Emitted whenever the document is changed
editor.on("change", (e) => {
  modified = true;
  if (e.data.range.start.row != e.data.range.end.row) {
    refreshPreview();
  }
});

// before unload
window.addEventListener("beforeunload", (event) => {
  if (modified === true) {
    let win = require('electron').remote.getCurrentWindow();
    let message = `The document has not yet been saved.
      Are you sure you want to quit?`;
    let result = dialog.showMessageBox(
        win,
        {
          type: "info",
          title: "SeaPig",
          message: message,
          buttons: ["OK", "Cancel"]
        }
    );
    if (result === 1) {
      event.returnValue = false;
    }
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
  let json = {
    key_bindings: keybindings.selectedIndex
  };
  storage.set('key_bindings', json, (error) => {
    if (error) throw error;
  });
  editor.focus();
}

keybindings.addEventListener("change", changeKeyBindings);

// load keybindings
storage.get('key_bindings', (error, data) => {
  if (error) throw error;

  if (Object.keys(data).length === 0) {
    keybindings.selectedIndex = FIRST_ITEM;
  } else {
    keybindings.selectedIndex = data.key_bindings;
  }
  changeKeyBindings();
});

// new file
const newBtn = document.getElementById("newBtn");
newBtn.addEventListener("click", (event) => {
  ipc.send('new-file');
});
                    
// open file
const openBtn = document.getElementById("openBtn");
openBtn.addEventListener("click", (event) => {
  let isNewWindow = false;
  if (currentFile !== "") {
    isNewWindow = true;
  } else {
    if (modified === true || editor.getValue().length > 0) {
      isNewWindow = true;
    }
  }
  ipc.send('open-file-dialog', currentFile, isNewWindow);
});

ipc.on('selected-file', (event, fullpath) => {
  openFile(fullpath[0]);
});

ipc.on('open-file', (event, fullpath) => {
  openFile(fullpath);
  webview.addEventListener('dom-ready', () => {
    refreshPreview();
  });
});

function openFile(fullpath) {
  currentFile = fullpath;
  document.title = `SeaPig - [${fullpath}]`;
  fs.readFile(fullpath, (error, text) => {
    if (error != null) {
      alert ('error: ' + error);
      return;
    }
    editor.setValue(text.toString(), -1);
    modified = false;
    refreshPreview();
  });
  editor.focus();
}

// save file
const saveBtn = document.getElementById("saveBtn");
saveBtn.addEventListener("click", (event) => {
  refreshPreview();
  if (currentFile == "") {
    ipc.send('save-new-file');
  } else {
    saveFile(currentFile);
  }
});

ipc.on('selected-save-file', (event, filename) => {
  saveFile(filename);
  editor.focus();
});

function saveFile(filename) {
  fs.writeFile (filename, editor.getValue(), (error) => {
    if (error != null) {
      alert ('error: ' + error + '\n' + filename);
      return;
    }
    currentFile = filename;
    modified = false;
    document.title = `SeaPig - [${filename}]`;
  });
}

// export html
const exportHTMLBtn = document.getElementById("exportHTMLBtn");
exportHTMLBtn.addEventListener("click", (event) => {
  refreshPreview();
  ipc.send('export-HTML', currentFile);
});

ipc.on('selected-HTML-file', (event, filename) => {
  webview.send('export-HTML', filename);
  editor.focus();
});

// export pdf
const exportPdfBtn = document.getElementById("exportPdfBtn");
exportPdfBtn.addEventListener("click", (event) => {
  refreshPreview();
  ipc.send('export-pdf-file', currentFile);
});

ipc.on('selected-pdf-file', (event, filename) => {
  webview.printToPDF({}, (error, data) => {
    if (error) throw error
      fs.writeFile(filename, data, (error) => {
        if (error) throw error
          console.log('Write PDF successfully.')
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
const hideEditorBtn = document.getElementById("hideEditorBtn");;
hideEditorBtn.addEventListener("click", (event) => {
  if (aceEditor.hasAttribute("style") == false &&
      previewer.hasAttribute("style") == false) {
    aceEditor.setAttribute("style", "display:none");
    refreshPreview ();
  } else if (
      aceEditor.hasAttribute("style") == false &&
      previewer.hasAttribute("style") == true) {
    previewer.removeAttribute("style");
    editor.resize(true);
    refreshPreview ();
  }
});

// hide preview
const HidePreviewBtn = document.getElementById("HidePreviewBtn");;
HidePreviewBtn.addEventListener("click", (event) => {
  if (aceEditor.hasAttribute("style") == true &&
      previewer.hasAttribute("style") == false) {
    aceEditor.removeAttribute("style");
    editor.resize (true);
    refreshPreview ();
  } else if (
      aceEditor.hasAttribute("style") == false &&
      previewer.hasAttribute("style") == false) {
    previewer.setAttribute("style", "display:none");
    editor.resize(true);
  }
});

// Refresh preview
const refreshBtn = document.getElementById("refreshBtn");
refreshBtn.addEventListener("click", (event) => {
  refreshPreview();
  editor.focus();
});

function refreshPreview () {
  let baseURI = "";
  if (currentFile != "") {
    baseURI = 'file://' + path.dirname(currentFile) + '/';
  }
  webview.send('preview', editor.getValue(), baseURI);
}

