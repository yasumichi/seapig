const hljs = require('highlight.js');
const viz = require("viz.js");
const uiflow = require("uiflow");
const mermaidAPI = require('../external/mermaid/mermaid.min.js').mermaidAPI;
const {sanitizeHtmlCustom} = require('./sanitize.js');

(function() {
  const mermaidWorkArea = document.getElementById("mermaidWorkArea");

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
      let date = new Date();
      let svgId = "m" + date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2)
        + ('0' + date.getDate()).slice(-2) + ('0' + date.getHours()).slice(-2)
        + ('0' + date.getMinutes()).slice(-2) + ('0' + date.getSeconds()).slice(-2)
        + ('00' + date.getMilliseconds()).slice(-3);
      let svg = mermaidAPI.render(svgId, code, undefined, mermaidWorkArea);

      return  `<div class="mermaid">\n${svg}</div>\n`;
    },
    "uiflow": (code) => {
      let dot = uiflow.compile(code);
      let svg = viz(dot);

      return svg;
    }
  };

  /**
   * customize to render list item
   * @param {string} text - contents of list item
   * @param {boolean} task - is listitem task?
   * @param {boolean} checked - is listitem checked?
   * @returns {string} converted list item
   */
  module.exports.rendererListitem =  (text, task, checked) => {
    return `<li>${sanitizeHtmlCustom(text)}</li>`;
  }

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
   * customize to render blockquote
   * @param {string} quote - contents of blockquote
   * @returns {string} converted blockquote block
   */
  module.exports.rendererBlockquote = (quote) => {
    return `<blockquote>${sanitizeHtmlCustom(quote)}</blockquote>\n`;
  }

  /**
   * customize to render HTML (sanitize script)
   * @param {string} html - contents of html code block
   * @returns {string} html or html code block
   */
  module.exports.rendererHtml = (html) => {
    return sanitizeHtmlCustom(html);
  }

  /**
   * customize to render heading
   * @param {string} text - contents of heading
   * @param {number} level - level of heading
   * @returns {string} HTML heading element
   */
  module.exports.rendererHeading = (text, level, raw, slugger) => {
    let id = slugger.slug(encodeURI(text));

    return  `<h${level} id="${id}">${sanitizeHtmlCustom(text)}</h${level}>\n`;
  }

  /**
   * customize to render paragraph
   * @param {string} text - contents of paragraph
   * @returns {string} HTML paragraph element
   */
  module.exports.rendererParagraph = (text) => {
    return `<p>${sanitizeHtmlCustom(text)}</p>\n`;
  }

  /**
   * customize to render tablecell
   * @param {string} content - contents of cell 
   * @param {object} flags - contents of cell 
   * @returns {string} HTML tablecell element
   */
  module.exports.rendererTablecell = (content, flags) => {
    var tag = flags.header ? 'th' : 'td';
    var align = flags.align ? ` align="${flags.align}"` : '';

    return `<${tag}${align}>${sanitizeHtmlCustom(content)}</${tag}>`;
  }

  module.exports.escapeHtml = escapeHtml;

}());
