/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Yasumichi Akahoshi
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const {app} = require('electron').remote;
const path = require('path');
const acePath = path.join(app.getAppPath(), 'external/ace');
const ace = require(path.join(acePath, 'ace.js'));
ace.config.set('basePath', acePath);
ace.require('theme-twilight');
ace.require('mode-markdown');
ace.require('keybinding-emacs');
ace.require('keybinding-vim');
ace.require('keybinding-sublime');

(function() {

  const editor = ace.edit("aceEditor");
  editor.setTheme("ace/theme/twilight");
  editor.getSession().setMode("ace/mode/markdown");
  editor.getSession().setUseWrapMode(true);
  editor.focus();

  module.exports = editor;

}());
