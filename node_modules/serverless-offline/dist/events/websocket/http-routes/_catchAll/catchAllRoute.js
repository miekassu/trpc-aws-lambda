"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = catchAllRoute;

var _debugLog = _interopRequireDefault(require("../../../../debugLog.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function catchAllRoute(v3Utils) {
  const log = v3Utils && v3Utils.log;
  return {
    method: 'GET',
    path: '/{path*}',

    handler(request, h) {
      const {
        url
      } = request;

      if (log) {
        log.debug(`got GET to ${url}`);
      } else {
        (0, _debugLog.default)(`got GET to ${url}`);
      }

      return h.response(null).code(426);
    }

  };
}