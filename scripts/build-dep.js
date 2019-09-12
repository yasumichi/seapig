const fs = require('fs');
const path = require('path');

const destdir = "ace";
const srcfiles = [
    'ace-builds/src-min-noconflict/ace.js',
    'ace-builds/src-min-noconflict/theme-twilight.js',
    'ace-builds/src-min-noconflict/mode-markdown.js',
    'ace-builds/src-min-noconflict/keybinding-emacs.js',
    'ace-builds/src-min-noconflict/keybinding-vim.js',
];

if ( fs.existsSync(destdir) == false ) {
    fs.mkdirSync(destdir);
    srcfiles.forEach((value) => {
        var destfile = path.join(destdir, path.basename(value));
        fs.copyFileSync(value, destfile);
    });
}
