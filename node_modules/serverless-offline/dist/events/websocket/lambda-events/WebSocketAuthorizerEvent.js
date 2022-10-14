"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _WebSocketRequestContext = _interopRequireDefault(require("./WebSocketRequestContext.js"));

var _index = require("../../../utils/index.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

var _connectionId = /*#__PURE__*/_classPrivateFieldLooseKey("connectionId");

var _httpsProtocol = /*#__PURE__*/_classPrivateFieldLooseKey("httpsProtocol");

var _rawHeaders = /*#__PURE__*/_classPrivateFieldLooseKey("rawHeaders");

var _url = /*#__PURE__*/_classPrivateFieldLooseKey("url");

var _websocketPort = /*#__PURE__*/_classPrivateFieldLooseKey("websocketPort");

var _provider = /*#__PURE__*/_classPrivateFieldLooseKey("provider");

class WebSocketAuthorizerEvent {
  constructor(connectionId, request, provider, options) {
    Object.defineProperty(this, _connectionId, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _httpsProtocol, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _rawHeaders, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _url, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _websocketPort, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _provider, {
      writable: true,
      value: null
    });
    const {
      httpsProtocol,
      websocketPort
    } = options;
    const {
      rawHeaders,
      url
    } = request;
    _classPrivateFieldLooseBase(this, _connectionId)[_connectionId] = connectionId;
    _classPrivateFieldLooseBase(this, _httpsProtocol)[_httpsProtocol] = httpsProtocol;
    _classPrivateFieldLooseBase(this, _rawHeaders)[_rawHeaders] = rawHeaders;
    _classPrivateFieldLooseBase(this, _url)[_url] = url;
    _classPrivateFieldLooseBase(this, _websocketPort)[_websocketPort] = websocketPort;
    _classPrivateFieldLooseBase(this, _provider)[_provider] = provider;
  }

  create() {
    const headers = (0, _index.parseHeaders)(_classPrivateFieldLooseBase(this, _rawHeaders)[_rawHeaders]);
    const multiValueHeaders = (0, _index.parseMultiValueHeaders)(_classPrivateFieldLooseBase(this, _rawHeaders)[_rawHeaders]);
    const multiValueQueryStringParameters = (0, _index.parseMultiValueQueryStringParameters)(_classPrivateFieldLooseBase(this, _url)[_url]);
    const queryStringParameters = (0, _index.parseQueryStringParameters)(_classPrivateFieldLooseBase(this, _url)[_url]);
    const requestContext = new _WebSocketRequestContext.default('CONNECT', '$connect', _classPrivateFieldLooseBase(this, _connectionId)[_connectionId]).create();
    return {
      type: 'REQUEST',
      methodArn: `arn:aws:execute-api:${_classPrivateFieldLooseBase(this, _provider)[_provider].region}:${requestContext.accountId}:${requestContext.apiId}/${requestContext.stage}/${requestContext.routeKey}`,
      headers,
      multiValueHeaders,
      // NOTE: multiValueQueryStringParameters and queryStringParameters
      // properties are only defined if they have values
      ...(multiValueQueryStringParameters && {
        multiValueQueryStringParameters
      }),
      ...(queryStringParameters && {
        queryStringParameters
      }),
      requestContext
    };
  }

}

exports.default = WebSocketAuthorizerEvent;