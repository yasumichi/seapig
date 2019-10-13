(function() {
  require('../external/mathjax/tex-svg-full.js');

  module.exports.tex2svg = (code) => {
    let svg = MathJax.tex2svg(code, {}).innerHTML;
    return  '<div class="mathjax">' + svg + '</div>';
  }
}());
