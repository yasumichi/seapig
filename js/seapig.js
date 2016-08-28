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

// Load electron modules
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;

// Load node native module
const fs = require('fs');
const path = require('path');

// Constants
const FIRST_ARG = 0;
const SECOND_ARG = 1;
const THIRD_ARG = 2;
const IDX_OFFSET = 1;
const markdownExt = /\.(md|mdwn|mkdn|mark.*|txt)$/

// Parse command line arguments
function getArguments() {
  let argv = [];
  let tmp_args = [];
  let tmp_opts = [];

  if (/^electron/.test(path.basename(process.argv[FIRST_ARG]))) {
    argv =  process.argv.slice(THIRD_ARG);
  } else {
    argv =  process.argv.slice(SECOND_ARG);
  }
  argv.forEach((element) => {
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
    icon: path.join(__dirname, '../seapig.png')
  });

	// Load mainwindow.html
	mainWindow.loadURL(
    `file://${path.resolve(__dirname ,'../mainwindow.html')}`
  );

	// Destroy when window is closed
	mainWindow.on('closed', () => {
		mainWindow = null;
	})
  if (process.env.DEBUG) {
    mainWindow.toggleDevTools();
  }

  return mainWindow;
}

// Show window when app is ready.
app.on('ready', () => {
  let winList = [];
  let ignoreList = [];
  let isFile = false;
  let program = getArguments();

  if (program.args.length) {
    program.args.forEach((element) => {
      let fullpath = element;
      if (!path.isAbsolute(element)) {
        fullpath = path.resolve(process.cwd(), element);
      }
      try {
        isFile = fs.statSync(fullpath).isFile();
      } catch (error) {
        isFile = false;
      }
      if (isFile && markdownExt.test(fullpath)) {
        let winIndex = winList.push(createWindow()) - IDX_OFFSET;
        winList[winIndex].webContents.on('dom-ready', () => {
          winList[winIndex].webContents.send('open-file', fullpath);
        });
      } else {
        ignoreList.push(`${fullpath} isn't  file.`);
      }
    });
  }
  if (!winList.length) {
    createWindow();
  }
  if (ignoreList.length) {
    dialog.showMessageBox({
      title: "Warning",
      type: "warning",
      message: 'Ignore bellow arguments.',
      detail: ignoreList.join('\n'),
      buttons: ['OK']
    });
  }
})

// Exit application when all window is closed.
app.on('window-all-closed', () => {
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
ipc.on('new-file', () => {
  createWindow();
});

// request open file dialog
ipc.on('open-file-dialog', (event, currentFile, isNewWindow) => {
  let options = {
    title: 'Open Markdown File',
    properties: ['openFile'],
    defaultPath: path.dirname(currentFile),
    filters: [
      {
        name: 'Markdown',
        extensions: [ 'md', 'mdwn', 'mkd', 'mkdn', 'mark*', 'txt' ]
      }
    ]
  };
  dialog.showOpenDialog(
      options,
      (filenames) => {
        if (filenames) {
          if (isNewWindow === true) {
            let newWindow = createWindow();
            newWindow.webContents.on('dom-ready', () => {
              newWindow.webContents.send('open-file', filenames[FIRST_ARG]);
            });
          } else {
            event.sender.send ('selected-file', filenames);
          }
        }
      }
      );
});

// request save new file
ipc.on('save-new-file', (event) => {
  let options = {
    title: 'Save Markdown File',
    properties: ['openFile'],
    defaultPath: `${getDefaultPath('')}.md`,
    filters: [
      {
        name: 'Markdown',
        extensions: [ 'md' ]
      }
    ]
  };
  dialog.showSaveDialog(
      options,
      (filenames) => {
        if (filenames) event.sender.send ('selected-save-file', filenames);
      }
      );
});

// request export HTML
ipc.on('export-HTML', (event, currentFile) => {
  let options = {
    title: 'Export HTML file',
    properties: ['openFile'],
    defaultPath: `${getDefaultPath(currentFile)}.html`,
    filters: [
      { name: 'HTML', extensions: [ 'html' ] }
    ]
  };
  dialog.showSaveDialog(
      options,
      (filename) => {
        if (filename) event.sender.send ('selected-HTML-file', filename);
      }
      );
});

// request export pfd
ipc.on('export-pdf-file', (event, currentFile) => {
  let options = {
    title: 'Export PDF file',
    properties: ['openFile'],
    defaultPath: `${getDefaultPath(currentFile)}.pdf`,
    filters: [
      { name: 'PDF', extensions: [ 'pdf' ] }
    ]
  };
  dialog.showSaveDialog(
      options,
      (filenames) => {
        if (filenames) event.sender.send ('selected-pdf-file', filenames);
      }
      );
});

// request error message
ipc.on('error-message', (event, error_msg) => {
  dialog.showMessageBox({
    title: "Error",
    type: "error",
    message: error_msg,
    buttons: ['OK']
  });
});
