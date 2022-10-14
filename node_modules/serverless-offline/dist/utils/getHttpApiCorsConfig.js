"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getHttpApiCorsConfig;

var _debugLog = _interopRequireDefault(require("../debugLog.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getHttpApiCorsConfig(httpApiCors, {
  log
}) {
  if (httpApiCors === true) {
    // default values that should be set by serverless
    // https://www.serverless.com/framework/docs/providers/aws/events/http-api/
    const c = {
      allowedOrigins: ['*'],
      allowedHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Amz-User-Agent'],
      allowedMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    };

    if (log) {
      log.debug('Using CORS policy', c);
    } else {
      (0, _debugLog.default)('Using CORS policy', c);
    }

    return c;
  }

  if (log) {
    log.debug('Using CORS policy', httpApiCors);
  } else {
    (0, _debugLog.default)('Using CORS policy', httpApiCors);
  }

  return httpApiCors;
}