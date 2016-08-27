import assert  from 'assert';
const Md2Html = require('../js/md2html.js');
var md2html = new Md2Html();

describe('convert markdown', () => {
  it('covert complete task', () => {
    assert(md2html.convert("- [x] Complete task") ===
      '<ul>\n<li class="task-list-item"><input type="checkbox" checked="true" disabled="true">Complete task</li></ul>\n'
    );
  });

  it('convert uncomplete task', () => {
    assert(md2html.convert("- [ ] Uncomplete task") ===
      '<ul>\n<li class="task-list-item"><input type="checkbox" disabled="true">Uncomplete task</li></ul>\n'
    );
  });
});
