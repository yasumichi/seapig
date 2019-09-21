const hljs = require('highlight.js');
const viz = require("viz.js");
const uiflow = require("uiflow");
const mermaidAPI = require('../external/mermaid/mermaid.min.js').mermaidAPI;
const FIRST_ITEM = 1;
const COUNT_UP = 1;

(function() {

  var mermaidCount = FIRST_ITEM;

  mermaidAPI.initialize({
    startOnLoad: false,
    cloneCssStyles: false
  });

  /**
   * @function
   * @name escapeHtml
   * @param {string} html - String includes HTML special characters.
   * @returns {string} String was escaped HTML special characters.
   * @description escape HTML special characters, from
   * {@link http://qiita.com/noriaki/items/4bfef8d7cf85dc1035b3}
   */
  function escapeHtml(html) {
    var escapeMap = {
      '&': '&amp;',
      '\x27': '&#39;',
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;'
    };

    return html.replace(/[&"'<>]/g, (char) => {
      let retChar = escapeMap[char];

      return retChar;
    });
  }

  const codeConverters = {
    "graphviz": (code) => {
      let svg = viz(code);

      return  svg;
    },
    "mermaid": (code) => {
      let svg = mermaidAPI.render(`mermaid${mermaidCount}`, code);
      mermaidCount += COUNT_UP;

      return  `<div class="mermaid">\n${svg}</div>\n`;
    },
    "uiflow": (code) => {
      let dot = uiflow.compile(code);
      let svg = viz(dot);

      return svg;
    }
  };

  /**
   * customize to render code
   * @param {string} code - contents of code block
   * @param {string} language - program language of code block
   * @returns {string} converted code block
   */
  module.exports.rendererCode = (code, language) => {
    const ERR_HEAD =
      "\n******************* Convert Error *******************\n";
    const ERR_TAIL =
      "\n*****************************************************\n";
    let hljsCode = hljs.highlightAuto(code).value;

    if (codeConverters[language]) {
      try {
        return  codeConverters[language](code);
      } catch (error) {
        let errMsg = String(error).trim();
        let retCode =
          `<pre><code>${hljsCode}${ERR_HEAD}${errMsg}${ERR_TAIL}</code></pre>`;

        return retCode;
      }
    }

    return `<pre><code>${hljsCode}</code></pre>`;
  }

  /**
   * customize to render HTML (sanitize script)
   * @param {string} html - contents of html code block
   * @returns {string} html or html code block
   */
  module.exports.rendererHtml = (html) => {
    if (/(<[^>]*script[^>]*>|<[^>]* on[^=>]*=)/.test(html)) {
      let hljsCode = hljs.highlightAuto(html).value.trim();

      return `<pre><code>${hljsCode}</code></pre>`;
    }

    return html;
  }

  /**
   * customize to render heading
   * @param {string} text - contents of heading
   * @param {number} level - level of heading
   * @returns {string} HTML heading element
   */
  module.exports.rendererHeading = (text, level) => {
    let id = encodeURI(text).replace(/%/g, "");

    return  `<h${level} id="${id}">${text}</h${level}>\n`;
  }

  module.exports.escapeHtml = escapeHtml;

}());
