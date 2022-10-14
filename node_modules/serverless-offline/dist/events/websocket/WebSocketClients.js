"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ws = require("ws");

var _boom = require("@hapi/boom");

var _index = require("./lambda-events/index.js");

var _debugLog = _interopRequireDefault(require("../../debugLog.js"));

var _serverlessLog = _interopRequireDefault(require("../../serverlessLog.js"));

var _index2 = require("../../config/index.js");

var _index3 = require("../../utils/index.js");

var _authFunctionNameExtractor = _interopRequireDefault(require("../authFunctionNameExtractor.js"));

var _authCanExecuteResource = _interopRequireDefault(require("../authCanExecuteResource.js"));

var _authValidateContext = _interopRequireDefault(require("../authValidateContext.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const {
  parse,
  stringify
} = JSON;

var _clients = /*#__PURE__*/_classPrivateFieldLooseKey("clients");

var _lambda = /*#__PURE__*/_classPrivateFieldLooseKey("lambda");

var _options = /*#__PURE__*/_classPrivateFieldLooseKey("options");

var _serverless = /*#__PURE__*/_classPrivateFieldLooseKey("serverless");

var _webSocketRoutes = /*#__PURE__*/_classPrivateFieldLooseKey("webSocketRoutes");

var _webSocketAuthorizers = /*#__PURE__*/_classPrivateFieldLooseKey("webSocketAuthorizers");

var _webSocketAuthorizersCache = /*#__PURE__*/_classPrivateFieldLooseKey("webSocketAuthorizersCache");

var _websocketsApiRouteSelectionExpression = /*#__PURE__*/_classPrivateFieldLooseKey("websocketsApiRouteSelectionExpression");

var _idleTimeouts = /*#__PURE__*/_classPrivateFieldLooseKey("idleTimeouts");

var _hardTimeouts = /*#__PURE__*/_classPrivateFieldLooseKey("hardTimeouts");

class WebSocketClients {
  constructor(serverless, options, lambda, v3Utils) {
    Object.defineProperty(this, _clients, {
      writable: true,
      value: new Map()
    });
    Object.defineProperty(this, _lambda, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _options, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _serverless, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _webSocketRoutes, {
      writable: true,
      value: new Map()
    });
    Object.defineProperty(this, _webSocketAuthorizers, {
      writable: true,
      value: new Map()
    });
    Object.defineProperty(this, _webSocketAuthorizersCache, {
      writable: true,
      value: new Map()
    });
    Object.defineProperty(this, _websocketsApiRouteSelectionExpression, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _idleTimeouts, {
      writable: true,
      value: new WeakMap()
    });
    Object.defineProperty(this, _hardTimeouts, {
      writable: true,
      value: new WeakMap()
    });
    _classPrivateFieldLooseBase(this, _lambda)[_lambda] = lambda;
    _classPrivateFieldLooseBase(this, _options)[_options] = options;
    _classPrivateFieldLooseBase(this, _serverless)[_serverless] = serverless;
    _classPrivateFieldLooseBase(this, _websocketsApiRouteSelectionExpression)[_websocketsApiRouteSelectionExpression] = serverless.service.provider.websocketsApiRouteSelectionExpression || _index2.DEFAULT_WEBSOCKETS_API_ROUTE_SELECTION_EXPRESSION;

    if (v3Utils) {
      this.log = v3Utils.log;
      this.progress = v3Utils.progress;
      this.writeText = v3Utils.writeText;
      this.v3Utils = v3Utils;
    }
  }

  _addWebSocketClient(client, connectionId) {
    _classPrivateFieldLooseBase(this, _clients)[_clients].set(client, connectionId);

    _classPrivateFieldLooseBase(this, _clients)[_clients].set(connectionId, client);

    this._onWebSocketUsed(connectionId);

    this._addHardTimeout(client, connectionId);
  }

  _removeWebSocketClient(client) {
    const connectionId = _classPrivateFieldLooseBase(this, _clients)[_clients].get(client);

    _classPrivateFieldLooseBase(this, _clients)[_clients].delete(client);

    _classPrivateFieldLooseBase(this, _clients)[_clients].delete(connectionId);

    return connectionId;
  }

  _getWebSocketClient(connectionId) {
    return _classPrivateFieldLooseBase(this, _clients)[_clients].get(connectionId);
  }

  _addHardTimeout(client, connectionId) {
    const timeoutId = setTimeout(() => {
      if (this.log) {
        this.log.debug(`timeout:hard:${connectionId}`);
      } else {
        (0, _debugLog.default)(`timeout:hard:${connectionId}`);
      }

      client.close(1001, 'Going away');
    }, _classPrivateFieldLooseBase(this, _options)[_options].webSocketHardTimeout * 1000);

    _classPrivateFieldLooseBase(this, _hardTimeouts)[_hardTimeouts].set(client, timeoutId);
  }

  _clearHardTimeout(client) {
    const timeoutId = _classPrivateFieldLooseBase(this, _hardTimeouts)[_hardTimeouts].get(client);

    clearTimeout(timeoutId);
  }

  _onWebSocketUsed(connectionId) {
    const client = this._getWebSocketClient(connectionId);

    this._clearIdleTimeout(client);

    if (this.log) {
      this.log.debug(`timeout:idle:${connectionId}:reset`);
    } else {
      (0, _debugLog.default)(`timeout:idle:${connectionId}:reset`);
    }

    const timeoutId = setTimeout(() => {
      if (this.log) {
        this.log.debug(`timeout:idle:${connectionId}:trigger`);
      } else {
        (0, _debugLog.default)(`timeout:idle:${connectionId}:trigger`);
      }

      client.close(1001, 'Going away');
    }, _classPrivateFieldLooseBase(this, _options)[_options].webSocketIdleTimeout * 1000);

    _classPrivateFieldLooseBase(this, _idleTimeouts)[_idleTimeouts].set(client, timeoutId);
  }

  _clearIdleTimeout(client) {
    const timeoutId = _classPrivateFieldLooseBase(this, _idleTimeouts)[_idleTimeouts].get(client);

    clearTimeout(timeoutId);
  }

  async verifyClient(connectionId, request) {
    const routeName = '$connect';

    const route = _classPrivateFieldLooseBase(this, _webSocketRoutes)[_webSocketRoutes].get(routeName);

    if (!route) {
      return {
        verified: false,
        statusCode: 502
      };
    }

    const connectEvent = new _index.WebSocketConnectEvent(connectionId, request, _classPrivateFieldLooseBase(this, _options)[_options]).create();

    const authFunName = _classPrivateFieldLooseBase(this, _webSocketAuthorizers)[_webSocketAuthorizers].get(routeName);

    if (authFunName) {
      const authorizerFunction = _classPrivateFieldLooseBase(this, _lambda)[_lambda].get(authFunName);

      const authorizeEvent = new _index.WebSocketAuthorizerEvent(connectionId, request, _classPrivateFieldLooseBase(this, _serverless)[_serverless].service.provider, _classPrivateFieldLooseBase(this, _options)[_options]).create();
      authorizerFunction.setEvent(authorizeEvent);

      if (this.log) {
        this.log.notice();
        this.log.notice(`Running Authorization function for ${routeName} (λ: ${authFunName})`);
      } else {
        console.log(''); // Just to make things a little pretty

        (0, _serverlessLog.default)(`Running Authorization function for ${routeName} (λ: ${authFunName})`);
      }

      try {
        const result = await authorizerFunction.runHandler();
        if (result === 'Unauthorized') return {
          verified: false,
          statusCode: 401
        };
        const policy = result; // Validate that the policy document has the principalId set

        if (!policy.principalId) {
          if (this.log) {
            this.log.notice(`Authorization response did not include a principalId: (λ: ${authFunName})`);
          } else {
            (0, _serverlessLog.default)(`Authorization response did not include a principalId: (λ: ${authFunName})`);
          }

          return {
            verified: false,
            statusCode: 403
          };
        }

        if (!(0, _authCanExecuteResource.default)(policy.policyDocument, authorizeEvent.methodArn)) {
          if (this.log) {
            this.log.notice(`Authorization response didn't authorize user to access resource: (λ: ${authFunName})`);
          } else {
            (0, _serverlessLog.default)(`Authorization response didn't authorize user to access resource: (λ: ${authFunName})`);
          }

          return {
            verified: false,
            statusCode: 403
          };
        }

        if (this.log) {
          this.log.notice(`Authorization function returned a successful response: (λ: ${authFunName})`);
        } else {
          (0, _serverlessLog.default)(`Authorization function returned a successful response: (λ: ${authFunName})`);
        }

        const validatedContext = (0, _authValidateContext.default)(policy.context, authorizerFunction);
        if (validatedContext instanceof Error) throw validatedContext;

        _classPrivateFieldLooseBase(this, _webSocketAuthorizersCache)[_webSocketAuthorizersCache].set(connectionId, {
          identity: {
            apiKey: policy.usageIdentifierKey,
            sourceIp: authorizeEvent.requestContext.sourceIp,
            userAgent: authorizeEvent.headers['user-agent'] || ''
          },
          authorizer: {
            integrationLatency: '42',
            principalId: policy.principalId,
            ...validatedContext
          }
        });
      } catch (err) {
        if (this.log) {
          this.log.debug(`Error in route handler '${routeName}' authorizer`, err);
        } else {
          (0, _debugLog.default)(`Error in route handler '${routeName}' authorizer`, err);
        }

        let headers = [];
        let message;

        if ((0, _boom.isBoom)(err)) {
          headers = err.output.headers;
          message = err.output.payload.message;
        }

        return {
          verified: false,
          statusCode: 500,
          headers,
          message
        };
      }
    }

    const authorizerData = _classPrivateFieldLooseBase(this, _webSocketAuthorizersCache)[_webSocketAuthorizersCache].get(connectionId);

    if (authorizerData) {
      connectEvent.requestContext.identity = authorizerData.identity;
      connectEvent.requestContext.authorizer = authorizerData.authorizer;
    }

    const lambdaFunction = _classPrivateFieldLooseBase(this, _lambda)[_lambda].get(route.functionKey);

    lambdaFunction.setEvent(connectEvent);

    try {
      const {
        statusCode
      } = await lambdaFunction.runHandler();
      const verified = statusCode >= 200 && statusCode < 300;
      return {
        verified,
        statusCode
      };
    } catch (err) {
      _classPrivateFieldLooseBase(this, _webSocketAuthorizersCache)[_webSocketAuthorizersCache].delete(connectionId);

      if (this.log) {
        this.log.debug(`Error in route handler '${route.functionKey}'`, err);
      } else {
        (0, _debugLog.default)(`Error in route handler '${route.functionKey}'`, err);
      }

      return {
        verified: false,
        statusCode: 502
      };
    }
  }

  async _processEvent(websocketClient, connectionId, routeKey, event) {
    let route = _classPrivateFieldLooseBase(this, _webSocketRoutes)[_webSocketRoutes].get(routeKey);

    if (!route && routeKey !== '$disconnect') {
      route = _classPrivateFieldLooseBase(this, _webSocketRoutes)[_webSocketRoutes].get('$default');
    }

    if (!route) {
      return;
    }

    const sendError = err => {
      if (websocketClient.readyState === _ws.OPEN) {
        websocketClient.send(stringify({
          connectionId,
          message: 'Internal server error',
          requestId: '1234567890'
        }));
      }

      if (this.log) {
        this.log.debug(`Error in route handler '${route.functionKey}'`, err);
      } else {
        (0, _debugLog.default)(`Error in route handler '${route.functionKey}'`, err);
      }
    };

    const authorizerData = _classPrivateFieldLooseBase(this, _webSocketAuthorizersCache)[_webSocketAuthorizersCache].get(connectionId);

    let authorizedEvent;

    if (authorizerData) {
      authorizedEvent = event;
      authorizedEvent.requestContext.identity = authorizerData.identity;
      authorizedEvent.requestContext.authorizer = authorizerData.authorizer;
    }

    const lambdaFunction = _classPrivateFieldLooseBase(this, _lambda)[_lambda].get(route.functionKey);

    lambdaFunction.setEvent(authorizedEvent || event);

    try {
      const {
        body
      } = await lambdaFunction.runHandler();

      if (body && routeKey !== '$disconnect' && route.definition.routeResponseSelectionExpression === '$default') {
        // https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-selection-expressions.html#apigateway-websocket-api-route-response-selection-expressions
        // TODO: Once API gateway supports RouteResponses, this will need to change to support that functionality
        // For now, send body back to the client
        this.send(connectionId, body);
      }
    } catch (err) {
      if (this.log) {
        this.log.error(err);
      } else {
        console.log(err);
      }

      sendError(err);
    }
  }

  _getRoute(value) {
    let json;

    try {
      json = parse(value);
    } catch (err) {
      return _index2.DEFAULT_WEBSOCKETS_ROUTE;
    }

    const routeSelectionExpression = _classPrivateFieldLooseBase(this, _websocketsApiRouteSelectionExpression)[_websocketsApiRouteSelectionExpression].replace('request.body', '');

    const route = (0, _index3.jsonPath)(json, routeSelectionExpression);

    if (typeof route !== 'string') {
      return _index2.DEFAULT_WEBSOCKETS_ROUTE;
    }

    return route || _index2.DEFAULT_WEBSOCKETS_ROUTE;
  }

  addClient(webSocketClient, connectionId) {
    this._addWebSocketClient(webSocketClient, connectionId);

    webSocketClient.on('close', () => {
      if (this.log) {
        this.log.debug(`disconnect:${connectionId}`);
      } else {
        (0, _debugLog.default)(`disconnect:${connectionId}`);
      }

      this._removeWebSocketClient(webSocketClient);

      const disconnectEvent = new _index.WebSocketDisconnectEvent(connectionId).create();

      this._clearHardTimeout(webSocketClient);

      this._clearIdleTimeout(webSocketClient);

      const authorizerData = _classPrivateFieldLooseBase(this, _webSocketAuthorizersCache)[_webSocketAuthorizersCache].get(connectionId);

      if (authorizerData) {
        disconnectEvent.requestContext.identity = authorizerData.identity;
        disconnectEvent.requestContext.authorizer = authorizerData.authorizer;
      }

      this._processEvent(webSocketClient, connectionId, '$disconnect', disconnectEvent).finally(() => _classPrivateFieldLooseBase(this, _webSocketAuthorizersCache)[_webSocketAuthorizersCache].delete(connectionId));
    });
    webSocketClient.on('message', message => {
      if (this.log) {
        this.log.debug(`message:${message}`);
      } else {
        (0, _debugLog.default)(`message:${message}`);
      }

      const route = this._getRoute(message);

      if (this.log) {
        this.log.debug(`route:${route} on connection=${connectionId}`);
      } else {
        (0, _debugLog.default)(`route:${route} on connection=${connectionId}`);
      }

      const event = new _index.WebSocketEvent(connectionId, route, message).create();

      const authorizerData = _classPrivateFieldLooseBase(this, _webSocketAuthorizersCache)[_webSocketAuthorizersCache].get(connectionId);

      if (authorizerData) {
        event.requestContext.identity = authorizerData.identity;
        event.requestContext.authorizer = authorizerData.authorizer;
      }

      this._onWebSocketUsed(connectionId);

      this._processEvent(webSocketClient, connectionId, route, event);
    });
  }

  _extractAuthFunctionName(endpoint) {
    if (typeof endpoint.authorizer === 'object' && endpoint.authorizer.type && endpoint.authorizer.type.toUpperCase() === 'TOKEN') {
      if (this.log) {
        this.log.debug(`Websockets does not support the TOKEN authorization type`);
      } else {
        (0, _debugLog.default)(`WARNING: Websockets does not support the TOKEN authorization type`);
      }

      return null;
    }

    const result = (0, _authFunctionNameExtractor.default)(endpoint, null, this);
    return result.unsupportedAuth ? null : result.authorizerName;
  }

  _configureAuthorization(endpoint, functionKey) {
    if (!endpoint.authorizer) {
      return;
    }

    if (endpoint.route === '$connect') {
      const authFunctionName = this._extractAuthFunctionName(endpoint);

      if (!authFunctionName) {
        return;
      }

      if (this.log) {
        this.log.notice(`Configuring Authorization: ${functionKey} ${authFunctionName}`);
      } else {
        (0, _serverlessLog.default)(`Configuring Authorization: ${functionKey} ${authFunctionName}`);
      }

      const authFunction = _classPrivateFieldLooseBase(this, _serverless)[_serverless].service.getFunction(authFunctionName);

      if (!authFunction) {
        if (this.log) {
          this.log.error(`Authorization function ${authFunctionName} does not exist`);
        } else {
          (0, _serverlessLog.default)(`WARNING: Authorization function ${authFunctionName} does not exist`);
        }

        return;
      }

      _classPrivateFieldLooseBase(this, _webSocketAuthorizers)[_webSocketAuthorizers].set(endpoint.route, authFunctionName);

      return;
    }

    if (this.log) {
      this.log.notice(`Configuring Authorization is supported only on $connect route`);
    } else {
      (0, _serverlessLog.default)(`Configuring Authorization is supported only on $connect route`);
    }
  }

  addRoute(functionKey, definition) {
    // set the route name
    _classPrivateFieldLooseBase(this, _webSocketRoutes)[_webSocketRoutes].set(definition.route, {
      functionKey,
      definition
    });

    if (!_classPrivateFieldLooseBase(this, _options)[_options].noAuth) {
      this._configureAuthorization(definition, functionKey);
    }

    if (this.log) {
      this.log.notice(`route '${definition.route} (λ: ${functionKey})'`);
    } else {
      (0, _serverlessLog.default)(`route '${definition.route} (λ: ${functionKey})'`);
    }
  }

  close(connectionId) {
    const client = this._getWebSocketClient(connectionId);

    if (client) {
      client.close();
      return true;
    }

    return false;
  }

  send(connectionId, payload) {
    const client = this._getWebSocketClient(connectionId);

    if (client) {
      this._onWebSocketUsed(connectionId);

      client.send(payload);
      return true;
    }

    return false;
  }

}

exports.default = WebSocketClients;