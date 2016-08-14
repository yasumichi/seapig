const {ipcRenderer} = require('electron');
const marked = require('marked');
const renderer = new marked.Renderer();
const hljs = require('highlight.js');
const fs = require('fs');
const path = require('path');
const Viz = require("viz.js");

marked.setOptions({
  renderer: renderer,
  gfm: true,
  breaks: true
});

// redering code
renderer.code = function (code, language) {
  const CONV_ERR_HEAD = "\n*************** Graphviz Convert Error ***************\n";
  const CONV_ERR_TAIL = "******************************************************\n";
  if (language == "graphviz") {
    let result;
    try {
      result = Viz(code);
      return result;
    } catch (error) {
      return '<pre><code>' + hljs.highlightAuto(code).value + CONV_ERR_HEAD + error + CONV_ERR_TAIL +'</code></pre>';
    }
  } else {
    return '<pre><code>' + hljs.highlightAuto(code).value + '</code></pre>';
  }
}

// rendering list
renderer.listitem = function (text) {
  if (text.startsWith("[x]")) {
    return '<li class="task-list-item"><input type="checkbox" checked="true" disabled="true">' + text.slice(3) + '</li>';
  } else if (text.startsWith("[ ]")) {
    return '<li class="task-list-item"><input type="checkbox" disabled="true">' + text.slice(3) + '</li>';
  } else {
    return '<li>' + text + '</li>';
  }
}

// rendering html (sanitize script)
renderer.html = function (html) {
  if (html.match(/<[^>]*script[^>]*>/g) !== null) {
    return '<pre><code>' + html.replace(/\</g, "&lt;").replace(/\>/g, "&gt;").trim() + '</code></pre>';
  } else if (html.match(/<[^>]* on[^=>]*=/) !== null) {
    return '<pre><code>' + html.replace(/\</g, "&lt;").replace(/\>/g, "&gt;").trim() + '</code></pre>';
  } else {
    return html;
  }
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

