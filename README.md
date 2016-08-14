SeaPig
=====

SeaPig is converter from markdown to html with marked.js and highlight.js.

![](https://qiita-image-store.s3.amazonaws.com/0/36738/626bd3fd-3c7e-bdaf-924a-db440462684f.png)

## Usage

SeaPig has two panes. Left pane is editor. Right pane is HTML previewer.

When you input new line, SeaPig refresh HTML preview.

SeaPig has tool bar contains one drop down list and four buttons.

You can select key bindings from drop down list. (default/emacs/vim)

Four buttons has feature below.

- Open markdown file to editor.
- Save markdown file from editor.
- Export HTML file from previewer.(At the same time css stylesheet is copied to same folder.)
- Export PDF file

## How to build

```
$ npm install --global-style
...
```

## How to lunch

```
$ npm start
```

## ToDo

- [x] save your favorite keybindings (default/emacs/vim)
- [x] support task list item.
- [ ] add viz.js support

## Special Thanks

- [Ace - The High Performance Code Editor for the Web](https://ace.c9.io/)
- [Electron - Build cross platform desktop apps with JavaScript, HTML, and CSS.](http://electron.atom.io/)
- [electron-json-storage](https://github.com/jviotti/electron-json-storage)
- [Github Markdown CSS - for Markdown Editor Preview](https://gist.github.com/andyferra/2554919)
- [highlight.js](https://highlightjs.org/)
- [marked](https://github.com/chjj/marked)
- [Node.js](https://nodejs.org/en/)
- [Photon](http://photonkit.com/)

