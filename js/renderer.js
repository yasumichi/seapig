const ipc = require('electron').ipcRenderer;
const webview = document.getElementById('previewer');
const fs = require('fs');
var current_file = "";

// change keybindings
const keybindings = document.getElementById("keybindings");
keybindings.addEventListener("change", function() {
  if (keybindings.value == "default") {
    editor.setKeyboardHandler(null);
  } else {
    editor.setKeyboardHandler(keybindings.value);
  }
  editor.focus();
});

// open file
const openBtn = document.getElementById("openBtn");
openBtn.addEventListener("click", function(event) {
  ipc.send('open-file-dialog');
});

ipc.on('selected-file', function (event, path) {
  fs.readFile(path[0], function(error, text) {
    if (error != null) {
      alert ('error: ' + error);
      return;
    }
    editor.setValue(text.toString(), -1);
    current_file = path[0];
  });
});

// save file
const saveBtn = document.getElementById("saveBtn");
saveBtn.addEventListener("click", function(event) {
  if (current_file == "") {
    ipc.send('save-new-file');
  } else {
    saveFile(current_file);
  }
});

ipc.on('selected-save-file', function (event, filename) {
  saveFile(filename);
});

function saveFile(filename) {
    fs.writeFile (filename, editor.getValue(), function (error) {
      if (error != null) {
        alert ('error: ' + error + '\n' + filename);
        return;
      }
      current_file = filename;
    });
}

// export html
const exportHTMLBtn = document.getElementById("exportHTMLBtn");
exportHTMLBtn.addEventListener("click", function (event) {
  ipc.send('export-HTML');
});

ipc.on('selected-HTML-file', function (event, filename) {
  webview.send('export-HTML', filename);
});

// export pdf
const exportPdfBtn = document.getElementById("exportPdfBtn");
exportPdfBtn.addEventListener("click", function (event) {
  ipc.send('export-pdf-file');
});

ipc.on('selected-pdf-file', function (event, filename) {
  webview.printToPDF({}, (error, data) => {
    if (error) throw error
      fs.writeFile(filename, data, (error) => {
        if (error) throw error
          console.log('Write PDF successfully.')
      })
  })
});

// Emitted whenever the document is changed
editor.on("change", function (e) {
  if (e.lines.length > 1) {
    webview.send('preview', editor.getValue());
  }
});

