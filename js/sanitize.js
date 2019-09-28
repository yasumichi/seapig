(function() {
  const sanitizeHtml = require('sanitize-html');
  const seapigAllowedTags = sanitizeHtml.defaults.allowedTags.concat([
    'h1', 'h2',
    'img',
    'input',
  ]);
  const seapigAllowedAttributes = {
    a: [ 'href', 'name', 'target' ],
    img: [ 'src' ],
    input: [
      {
        name: 'type',
        values: 'checkbox'
      },
      'checked',
      'disabled'
    ]
  };

  module.exports.sanitizeHtmlCustom = (html) => {
    return  sanitizeHtml(html, {
      allowedTags: seapigAllowedTags,
      allowedAttributes: seapigAllowedAttributes
    });
  }
}());
