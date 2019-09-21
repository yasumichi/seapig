const fs = require('fs');
const path = require('path');

const extdir = "external";

const copyplan = [
  // for ace
  {
    destdir: path.join(extdir, "ace"),
    srcfiles: [
      'ace-builds/LICENSE',
      'ace-builds/src-min-noconflict/ace.js',
      'ace-builds/src-min-noconflict/keybinding-emacs.js',
      'ace-builds/src-min-noconflict/keybinding-vim.js',
      'ace-builds/src-min-noconflict/mode-markdown.js',
      'ace-builds/src-min-noconflict/theme-twilight.js',
    ]
  },
  // for mermaid
  {
    destdir: path.join(extdir, "mermaid"),
    srcfiles: [
      'node_modules/mermaid/LICENSE',
      'node_modules/mermaid/dist/mermaid.min.js',
    ]
  },
  // for mithril
  {
    destdir: path.join(extdir, "mithril"),
    srcfiles: [
      'node_modules/mithril/LICENSE',
      'node_modules/mithril/mithril.min.js',
    ]
  }
];

copyplan.forEach((value) => {
  var destdir = value.destdir;
  var srcfiles = value.srcfiles;

  if ( fs.existsSync(destdir) == false ) {
    fs.mkdirSync(destdir, {recursive: true});
    srcfiles.forEach((value) => {
      var destfile = path.join(destdir, path.basename(value));
      fs.copyFileSync(value, destfile);
    });
  }
});
