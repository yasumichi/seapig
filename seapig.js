// Load electron modules
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;

// Load node native module
const path = require('path');

// Create window
var mainWindow = null;

function createWindow() {
	// Create a instance of BrowserWindow
	mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'seapig.png')
  });

	// Load mainwindow.html
	mainWindow.loadURL(path.join('file://', __dirname ,'/mainwindow.html'));

	// Destroy when window is closed
	mainWindow.on('closed', function() {
		mainWindow = null;
	})
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

// getDefaultPath
function getDefaultPath(currentFile) {
  let defaultPath = "";

  if (currentFile == "") {
    defaultPath = app.getPath('documents');
  } else {
    defaultPath = path.dirname(currentFile);
  }

  return  defaultPath;
}

// request open file dialog
ipc.on('open-file-dialog', function (event, currentFile) {
  let options = {
    title: 'Open Markdown File',
    properties: ['openFile'],
    defaultPath: getDefaultPath(currentFile),
    filters: [
      {
        name: 'Markdown',
        extensions: [ 'md', 'mdwn', 'mkd', 'mkdn', 'mark*' ]
      }
    ]
  };
  dialog.showOpenDialog(
      options,
      function (filenames) {
        if (filenames) event.sender.send ('selected-file', filenames);
      }
      );
});

// request save new file
ipc.on('save-new-file', function (event) {
  let options = {
    title: 'Save Markdown File',
    properties: ['openFile'],
    defaultPath: app.getPath('documents'),
    filters: [
      {
        name: 'Markdown',
        extensions: [ 'md' ]
      }
    ]
  };
  dialog.showSaveDialog(
      options,
      function (filenames) {
        if (filenames) event.sender.send ('selected-save-file', filenames);
      }
      );
});

// request export HTML
ipc.on('export-HTML', function (event, currentFile) {
  let options = {
    title: 'Export HTML file',
    properties: ['openFile'],
    defaultPath: getDefaultPath(currentFile),
    filters: [
      { name: 'HTML', extensions: [ 'html' ] }
    ]
  };
  dialog.showSaveDialog(
      options,
      function (filename) {
        if (filename) event.sender.send ('selected-HTML-file', filename);
      }
      );
});

// request export pfd
ipc.on('export-pdf-file', function (event, currentFile) {
  let options = {
    title: 'Export PDF file',
    properties: ['openFile'],
    defaultPath: getDefaultPath(currentFile),
    filters: [
      { name: 'PDF', extensions: [ 'pdf' ] }
    ]
  };
  dialog.showSaveDialog(
      options,
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
