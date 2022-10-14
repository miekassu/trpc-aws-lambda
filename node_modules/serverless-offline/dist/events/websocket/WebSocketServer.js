"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ws = require("ws");

var _debugLog = _interopRequireDefault(require("../../debugLog.js"));

var _serverlessLog = _interopRequireDefault(require("../../serverlessLog.js"));

var _index = require("../../utils/index.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

var _options = /*#__PURE__*/_classPrivateFieldLooseKey("options");

var _webSocketClients = /*#__PURE__*/_classPrivateFieldLooseKey("webSocketClients");

var _connectionIds = /*#__PURE__*/_classPrivateFieldLooseKey("connectionIds");

class WebSocketServer {
  constructor(options, webSocketClients, sharedServer, v3Utils) {
    Object.defineProperty(this, _options, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _webSocketClients, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _connectionIds, {
      writable: true,
      value: new Map()
    });
    _classPrivateFieldLooseBase(this, _options)[_options] = options;
    _classPrivateFieldLooseBase(this, _webSocketClients)[_webSocketClients] = webSocketClients;

    if (v3Utils) {
      this.log = v3Utils.log;
      this.progress = v3Utils.progress;
      this.writeText = v3Utils.writeText;
      this.v3Utils = v3Utils;
    }

    const server = new _ws.Server({
      server: sharedServer,
      verifyClient: ({
        req
      }, cb) => {
        const connectionId = (0, _index.createUniqueId)();
        const key = req.headers['sec-websocket-key'];

        if (this.log) {
          this.log.debug(`verifyClient:${key} ${connectionId}`);
        } else {
          (0, _debugLog.default)(`verifyClient:${key} ${connectionId}`);
        } // Use the websocket key to coorelate connection IDs


        _classPrivateFieldLooseBase(this, _connectionIds)[_connectionIds][key] = connectionId;

        _classPrivateFieldLooseBase(this, _webSocketClients)[_webSocketClients].verifyClient(connectionId, req).then(({
          verified,
          statusCode,
          message,
          headers
        }) => {
          try {
            if (!verified) {
              cb(false, statusCode, message, headers);
              return;
            }

            cb(true);
          } catch (e) {
            (0, _debugLog.default)(`Error verifying`, e);
            cb(false);
          }
        });
      }
    });
    server.on('connection', (webSocketClient, request) => {
      if (this.log) {
        this.log.notice('received connection');
      } else {
        console.log('received connection');
      }

      const {
        headers
      } = request;
      const key = headers['sec-websocket-key'];

      const connectionId = _classPrivateFieldLooseBase(this, _connectionIds)[_connectionIds][key];

      if (this.log) {
        this.log.debug(`connect:${connectionId}`);
      } else {
        (0, _debugLog.default)(`connect:${connectionId}`);
      }

      _classPrivateFieldLooseBase(this, _webSocketClients)[_webSocketClients].addClient(webSocketClient, connectionId);
    });
  }

  async start() {
    const {
      host,
      httpsProtocol,
      websocketPort
    } = _classPrivateFieldLooseBase(this, _options)[_options];

    if (this.log) {
      this.log.notice(`Offline [websocket] listening on ws${httpsProtocol ? 's' : ''}://${host}:${websocketPort}`);
    } else {
      (0, _serverlessLog.default)(`Offline [websocket] listening on ws${httpsProtocol ? 's' : ''}://${host}:${websocketPort}`);
    }
  } // no-op, we're re-using the http server


  stop() {}

  addRoute(functionKey, webSocketEvent) {
    _classPrivateFieldLooseBase(this, _webSocketClients)[_webSocketClients].addRoute(functionKey, webSocketEvent); // serverlessLog(`route '${route}'`)

  }

}

exports.default = WebSocketServer;