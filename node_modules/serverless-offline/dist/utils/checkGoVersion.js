"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = checkGoVersion;

var _execa = _interopRequireDefault(require("execa"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function checkGoVersion() {
  let goVersion;

  try {
    const {
      stdout
    } = await (0, _execa.default)('go', ['version']);

    if (stdout.match(/go1.\d+/g)) {
      goVersion = '1.x';
    }
  } catch (err) {// @ignore
  }

  return goVersion;
}