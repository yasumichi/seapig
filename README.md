SeaPig
=====

![](https://raw.githubusercontent.com/yasumichi/seapig/master/seapig.png)SeaPig is converter from markdown to html with marked.js and highlight.js.

![](https://raw.githubusercontent.com/yasumichi/screenshots/master/seapig/seapig.png)

## Usage

SeaPig has two panes. Left pane is editor. Right pane is HTML previewer.

When you input new line, SeaPig refresh HTML preview.

SeaPig has tool bar contains one drop down list and five buttons.

![](https://raw.githubusercontent.com/yasumichi/screenshots/master/seapig/seapig-toolbar.png)

You can select key bindings from drop down list. (default/emacs/vim)

Five buttons has feature below.

- Open markdown file to editor.
- Save markdown file from editor.
- Export HTML file from previewer.(At the same time css stylesheet is copied to same folder.)
- Export PDF file
- Refresh HTML preview

### viz.js support

When You write code block as `graphviz` language and write dot language, rendering graph image at svg as below.

<pre>
```graphviz
digraph g { a -> b; }
```
</pre>

to

![](https://raw.githubusercontent.com/yasumichi/screenshots/master/seapig/digraph.png)

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
- [x] add viz.js support

## Special Thanks

- [Ace - The High Performance Code Editor for the Web](https://ace.c9.io/)
- [Electron - Build cross platform desktop apps with JavaScript, HTML, and CSS.](http://electron.atom.io/)
- [electron-json-storage](https://github.com/jviotti/electron-json-storage)
- [Github Markdown CSS - for Markdown Editor Preview](https://gist.github.com/andyferra/2554919)
- [highlight.js](https://highlightjs.org/)
- [marked](https://github.com/chjj/marked)
- [Node.js](https://nodejs.org/en/)
- [Photon](http://photonkit.com/)
- [viz.js](https://github.com/mdaines/viz.js)
- [いらすとや](http://www.irasutoya.com/)(application icon)

# License

MIT (excludes ace, node_modules and icons)

Copyright &copy; 2016 Yasumichi Akahoshi

# Icons copyright

- seapig.icns
- seapig.ico
- seapig.png

Copyright &copy; いらすとや. All Rights Reserved. 
