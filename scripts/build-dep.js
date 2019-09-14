const fs = require('fs');
const path = require('path');

const extdir = "external";
const acedest = path.join(extdir, "ace");
const srcfiles = [
    'ace-builds/src-min-noconflict/ace.js',
    'ace-builds/src-min-noconflict/theme-twilight.js',
    'ace-builds/src-min-noconflict/mode-markdown.js',
    'ace-builds/src-min-noconflict/keybinding-emacs.js',
    'ace-builds/src-min-noconflict/keybinding-vim.js',
];

if ( fs.existsSync(acedest) == false ) {
    fs.mkdirSync(acedest, {recursive: true});
    srcfiles.forEach((value) => {
        var destfile = path.join(acedest, path.basename(value));
        fs.copyFileSync(value, destfile);
    });
}
