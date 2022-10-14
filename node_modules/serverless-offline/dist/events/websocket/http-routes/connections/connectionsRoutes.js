"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = connectionsRoutes;

var _ConnectionsController = _interopRequireDefault(require("./ConnectionsController.js"));

var _debugLog = _interopRequireDefault(require("../../../../debugLog.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function connectionsRoutes(webSocketClients, v3Utils) {
  const log = v3Utils && v3Utils.log;
  const connectionsController = new _ConnectionsController.default(webSocketClients);
  return [{
    method: 'POST',
    options: {
      payload: {
        parse: false
      }
    },
    path: '/@connections/{connectionId}',

    async handler(request, h) {
      const {
        params: {
          connectionId
        },
        payload,
        url
      } = request;

      if (log) {
        log.debug(`got POST to ${url}`);
      } else {
        (0, _debugLog.default)(`got POST to ${url}`);
      }

      const clientExisted = await connectionsController.send(connectionId, payload);

      if (!clientExisted) {
        return h.response(null).code(410);
      }

      if (log) {
        log.debug(`sent data to connection:${connectionId}`);
      } else {
        (0, _debugLog.default)(`sent data to connection:${connectionId}`);
      }

      return null;
    }

  }, {
    method: 'DELETE',
    options: {
      payload: {
        parse: false
      }
    },
    path: '/@connections/{connectionId}',

    handler(request, h) {
      const {
        params: {
          connectionId
        },
        url
      } = request;

      if (log) {
        log.debug(`got DELETE to ${url}`);
      } else {
        (0, _debugLog.default)(`got DELETE to ${url}`);
      }

      const clientExisted = connectionsController.remove(connectionId);

      if (!clientExisted) {
        return h.response(null).code(410);
      }

      if (log) {
        log.debug(`closed connection:${connectionId}`);
      } else {
        (0, _debugLog.default)(`closed connection:${connectionId}`);
      }

      return h.response(null).code(204);
    }

  }];
}