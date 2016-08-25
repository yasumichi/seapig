(function() {

  /**
   * @function
   * @name escapeHtml
   * @description escape HTML special characters, from
   * {@link http://qiita.com/noriaki/items/4bfef8d7cf85dc1035b3#comment-3e30a57522c7d6833a7f}
   * @parm {string} String - String includes HTML special characters.
   * @returns {string} String - String was escaped HTML special characters.
   */
  var escapeHtml = (function (String) {
    var escapeMap = {
      '&': '&amp;',
      '\x27': '&#39;',
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;'
    };

    function callbackfn (char) {
      if (!escapeMap.hasOwnProperty(char)) {
        throw new Error;
      }

      return escapeMap[char];
    }

    return function escapeHtml (string) {
      return String(string).replace(/[&"'<>]/g, callbackfn);
    };
  }(String));

  module.exports = escapeHtml;

}());
