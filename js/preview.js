const {ipcRenderer} = require('electron');
const marked = require('marked');
const renderer = new marked.Renderer();
const hljs = require('highlight.js');
const fs = require('fs');
const path = require('path');

renderer.code = function (code, language) {
  return '<pre><code>' + hljs.highlightAuto(code).value + '</code></pre>';
}

// request preview
ipcRenderer.on('preview', function(event, data, baseURI) {
  if (baseURI != "") {
    let base = document.getElementsByTagName("base")[0];
    base.setAttribute("href", baseURI);
  }
  document.getElementById('body').innerHTML = marked(data, { renderer: renderer });
  document.title = document.getElementsByTagName("h1")[0].innerHTML;
});

// request export HTML
ipcRenderer.on('export-HTML', function(event, filename) {
  let base = document.getElementsByTagName("base")[0];
  base.removeAttribute("href");

  // http://blog.mudatobunka.org/entry/2015/12/23/211425#postscript
  fs.writeFile (filename, new XMLSerializer().serializeToString(document), function (error) {
    if (error != null) {
      alert ('error: ' + error + '\n' + filename);
      return;
    }
    let src_css = path.join(__dirname, '../templates/github.css');
    let dest_css = path.join(path.dirname(filename), "github.css");
    fs.createReadStream(src_css).pipe(fs.createWriteStream(dest_css));
  });
});

