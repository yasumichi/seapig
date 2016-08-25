// Load electron modules
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;

// Load node native module
const fs = require('fs');
const path = require('path');

// Parse command line arguments
var program = getArguments();

function getArguments() {
  let argv = [];
  let tmp_args = [];
  let tmp_opts = [];

  if (/^electron/.test(path.basename(process.argv[0]))) {
    argv =  process.argv.slice(2);
  } else {
    argv =  process.argv.slice(1);
  }
  argv.forEach( (element) => {
    if (/^-/.test(element) === true) {
      tmp_opts.push(element);
    } else {
      tmp_args.push(element);
    }
  });

  return  { opts: tmp_opts, args: tmp_args };
}

// Create window
function createWindow() {
  let mainWindow = null;

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
  if (process.env.DEBUG) {
    mainWindow.toggleDevTools();
  }

  return mainWindow;
}

// Show window when app is ready.
app.on('ready', function() {
  let winList = [];
  let ignoreList = [];
  let isFile = false;

  if (program.args.length > 0) {
    program.args.forEach((element) => {
      let fullpath;
      if (path.isAbsolute(element)) {
        fullpath = element;
      } else {
        fullpath = path.resolve(process.cwd(), element);
      }
      try {
        isFile = fs.statSync(fullpath).isFile();
      } catch (error) {
        isFile = false;
      }
      if (isFile == true) {
        if (/\.(md|mdwn|mkdn|mark.*|txt)$/.test(fullpath) == true) {
          let winIndex = winList.push(createWindow()) - 1;
          winList[winIndex].webContents.on('dom-ready', () => {
            winList[winIndex].webContents.send('open-file', fullpath);
          });
        } else {
          ignoreList.push(`${fullpath} isn't markdown.`);
        }
      } else {
        ignoreList.push(`${fullpath} isn't  file.`);
      }
    });
  }
  if (winList.length === 0) {
    createWindow();
  }
  if (ignoreList.length > 0) {
    dialog.showMessageBox({
      title: "Warning",
      type: "warning",
      message: 'Ignore bellow arguments.',
      detail: ignoreList.join('\n'),
      buttons: ['OK']
    }, () => {
    }
    );
  }
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
    defaultPath = path.join(app.getPath('documents'), 'new_file');
  } else {
    defaultPath = path.join(
      path.dirname(currentFile),
      path.basename(currentFile, path.extname(currentFile))
    );
  }

  return  defaultPath;
}

// request new file
ipc.on('new-file', (event) => {
  createWindow();
});

// request open file dialog
ipc.on('open-file-dialog', function (event, currentFile, isNewWindow) {
  let options = {
    title: 'Open Markdown File',
    properties: ['openFile'],
    defaultPath: getDefaultPath(currentFile),
    filters: [
      {
        name: 'Markdown',
        extensions: [ 'md', 'mdwn', 'mkd', 'mkdn', 'mark*', 'txt' ]
      }
    ]
  };
  dialog.showOpenDialog(
      options,
      function (filenames) {
        if (filenames) {
          if (isNewWindow === true) {
            let newWindow = createWindow();
            newWindow.webContents.on('dom-ready', () => {
              newWindow.webContents.send('open-file', filenames[0]);
            });
          } else {
            event.sender.send ('selected-file', filenames);
          }
        }
      }
      );
});

// request save new file
ipc.on('save-new-file', function (event) {
  let options = {
    title: 'Save Markdown File',
    properties: ['openFile'],
    defaultPath: getDefaultPath('') + '.md',
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
    defaultPath: getDefaultPath(currentFile) + '.html',
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
    defaultPath: getDefaultPath(currentFile) + '.pdf',
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
