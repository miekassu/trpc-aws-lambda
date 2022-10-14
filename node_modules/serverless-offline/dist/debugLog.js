"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _process = require("process");

var _default = typeof _process.env.SLS_DEBUG !== 'undefined' ? console.log.bind(null, '[offline]') : () => null;

exports.default = _default;