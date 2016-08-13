// Load electron modules
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;

// Load node native module
const path = require('path');
var fs = require('fs');

// Create window
var mainWindow = null;

function createWindow() {
	// Create a instance of BrowserWindow
	mainWindow = new BrowserWindow({width: 800, height: 600});

	// Load mainwindow.html
	mainWindow.loadURL(path.join('file://', __dirname ,'/mainwindow.html'));

	// Destroy when window is closed
	mainWindow.on('closed', function() {
		mainWindow = null;
	})
}

// Render HTML from markdown
function renderHTML(filename) {
	output.innerHTML = marked('# Test');
}

// Show window when app is ready.
app.on('ready', function() {
	createWindow();
})

// Exit application when all window is closed.
app.on('window-all-closed', function() {
	if (process.platform !== 'darwin') {
		app.quit();
	}
})

// request open file dialog
ipc.on('open-file-dialog', function (event) {
  dialog.showOpenDialog({
        properties: ['openFile'],
        fileters: [
        {
          name: 'Markdown',
          extentions: [ 'md', 'mdwn', 'mkd', 'mkdn', 'mark*' ]
        }
        ]
      },
      function (filenames) {
        if (filenames) event.sender.send ('selected-file', filenames);
      }
      );
});

// request save new file
ipc.on('save-new-file', function (event) {
  dialog.showSaveDialog({
        properties: ['openFile'],
        fileters: [
        {
          name: 'Markdown',
          extentions: [ 'md', 'mdwn', 'mkd', 'mkdn', 'mark*' ]
        }
        ]
      },
      function (filenames) {
        if (filenames) event.sender.send ('selected-save-file', filenames);
      }
      );
});

// request export HTML
ipc.on('export-HTML', function (event) {
  dialog.showSaveDialog({
        properties: ['openFile'],
        fileters: [
        {
          name: 'HTML',
          extentions: [ 'html' ]
        }
        ]
      },
      function (filename) {
        if (filename) event.sender.send ('selected-HTML-file', filename);
      }
      );
});

// request export pfd
ipc.on('export-pdf-file', function (event) {
  dialog.showSaveDialog({
        properties: ['openFile'],
        fileters: [
        {
          name: 'PDF',
          extentions: [ 'pdf' ]
        }
        ]
      },
      function (filenames) {
        if (filenames) event.sender.send ('selected-pdf-file', filenames);
      }
      );
});

// request error message
ipc.on('error-message', function (event, error_msg) {
  dialog.showMessageBox({
    title: "Error",
    type: "error",
    message: error_msg,
    buttons: ['OK']
  });
});
