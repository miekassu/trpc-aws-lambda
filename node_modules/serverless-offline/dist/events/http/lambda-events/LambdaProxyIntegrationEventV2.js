"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _buffer = require("buffer");

var _process = require("process");

var _jsonwebtoken = require("jsonwebtoken");

var _index = require("../../../utils/index.js");

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const {
  isArray
} = Array;
const {
  parse
} = JSON;
const {
  assign,
  entries,
  fromEntries
} = Object; // https://www.serverless.com/framework/docs/providers/aws/events/http-api/
// https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html

var _routeKey = /*#__PURE__*/_classPrivateFieldLooseKey("routeKey");

var _request = /*#__PURE__*/_classPrivateFieldLooseKey("request");

var _stage = /*#__PURE__*/_classPrivateFieldLooseKey("stage");

var _stageVariables = /*#__PURE__*/_classPrivateFieldLooseKey("stageVariables");

var _additionalRequestContext = /*#__PURE__*/_classPrivateFieldLooseKey("additionalRequestContext");

class LambdaProxyIntegrationEventV2 {
  constructor(request, stage, routeKey, stageVariables, additionalRequestContext, v3Utils) {
    Object.defineProperty(this, _routeKey, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _request, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _stage, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _stageVariables, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _additionalRequestContext, {
      writable: true,
      value: null
    });
    _classPrivateFieldLooseBase(this, _routeKey)[_routeKey] = routeKey;
    _classPrivateFieldLooseBase(this, _request)[_request] = request;
    _classPrivateFieldLooseBase(this, _stage)[_stage] = stage;
    _classPrivateFieldLooseBase(this, _stageVariables)[_stageVariables] = stageVariables;
    _classPrivateFieldLooseBase(this, _additionalRequestContext)[_additionalRequestContext] = additionalRequestContext || {};

    if (v3Utils) {
      this.log = v3Utils.log;
      this.progress = v3Utils.progress;
      this.writeText = v3Utils.writeText;
      this.v3Utils = v3Utils;
    }
  }

  create() {
    const authContext = _classPrivateFieldLooseBase(this, _request)[_request].auth && _classPrivateFieldLooseBase(this, _request)[_request].auth.credentials && _classPrivateFieldLooseBase(this, _request)[_request].auth.credentials.context || {};
    let authAuthorizer;

    if (_process.env.AUTHORIZER) {
      try {
        authAuthorizer = parse(_process.env.AUTHORIZER);
      } catch (error) {
        if (this.log) {
          this.log.error('Could not parse process.env.AUTHORIZER, make sure it is correct JSON');
        } else {
          console.error('Serverless-offline: Could not parse process.env.AUTHORIZER, make sure it is correct JSON.');
        }
      }
    }

    let body = _classPrivateFieldLooseBase(this, _request)[_request].payload;

    const {
      rawHeaders
    } = _classPrivateFieldLooseBase(this, _request)[_request].raw.req; // NOTE FIXME request.raw.req.rawHeaders can only be null for testing (hapi shot inject())


    const headers = (0, _index.lowerCaseKeys)((0, _index.parseHeaders)(rawHeaders || [])) || {};

    if (headers['sls-offline-authorizer-override']) {
      try {
        authAuthorizer = parse(headers['sls-offline-authorizer-override']);
      } catch (error) {
        if (this.log) {
          this.log.error('Could not parse header sls-offline-authorizer-override, make sure it is correct JSON');
        } else {
          console.error('Serverless-offline: Could not parse header sls-offline-authorizer-override make sure it is correct JSON.');
        }
      }
    }

    if (body) {
      if (typeof body !== 'string') {
        // this.#request.payload is NOT the same as the rawPayload
        body = _classPrivateFieldLooseBase(this, _request)[_request].rawPayload;
      }

      if (!headers['content-length'] && (typeof body === 'string' || body instanceof _buffer.Buffer || body instanceof ArrayBuffer)) {
        headers['content-length'] = String(_buffer.Buffer.byteLength(body));
      } // Set a default Content-Type if not provided.


      if (!headers['content-type']) {
        headers['content-type'] = 'application/json';
      }
    } else if (typeof body === 'undefined' || body === '') {
      body = null;
    } // clone own props


    const pathParams = { ..._classPrivateFieldLooseBase(this, _request)[_request].params
    };
    let token = headers.Authorization || headers.authorization;

    if (token && token.split(' ')[0] === 'Bearer') {
      ;
      [, token] = token.split(' ');
    }

    let claims;
    let scopes;

    if (token) {
      try {
        claims = (0, _jsonwebtoken.decode)(token) || undefined;

        if (claims && claims.scope) {
          scopes = claims.scope.split(' '); // In AWS HTTP Api the scope property is removed from the decoded JWT
          // I'm leaving this property because I'm not sure how all of the authorizers
          // for AWS REST Api handle JWT.
          // claims = { ...claims }
          // delete claims.scope
        }
      } catch (err) {// Do nothing
      }
    }

    const {
      headers: _headers,
      info: {
        received,
        remoteAddress
      },
      method
    } = _classPrivateFieldLooseBase(this, _request)[_request];

    const httpMethod = method.toUpperCase();
    const requestTime = (0, _index.formatToClfTime)(received);
    const requestTimeEpoch = received;
    const cookies = entries(_classPrivateFieldLooseBase(this, _request)[_request].state).flatMap(([key, value]) => {
      if (isArray(value)) {
        return value.map(v => `${key}=${v}`);
      }

      return `${key}=${value}`;
    });
    return {
      version: '2.0',
      routeKey: _classPrivateFieldLooseBase(this, _routeKey)[_routeKey],
      rawPath: _classPrivateFieldLooseBase(this, _request)[_request].url.pathname,
      rawQueryString: _classPrivateFieldLooseBase(this, _request)[_request].url.searchParams.toString(),
      cookies,
      headers,
      queryStringParameters: _classPrivateFieldLooseBase(this, _request)[_request].url.search ? fromEntries(Array.from(_classPrivateFieldLooseBase(this, _request)[_request].url.searchParams)) : null,
      requestContext: {
        accountId: 'offlineContext_accountId',
        apiId: 'offlineContext_apiId',
        authorizer: authAuthorizer || assign(authContext, {
          jwt: {
            claims,
            scopes
          }
        }),
        domainName: 'offlineContext_domainName',
        domainPrefix: 'offlineContext_domainPrefix',
        http: {
          method: httpMethod,
          path: _classPrivateFieldLooseBase(this, _request)[_request].url.pathname,
          protocol: 'HTTP/1.1',
          sourceIp: remoteAddress,
          userAgent: _headers['user-agent'] || ''
        },
        operationName: _classPrivateFieldLooseBase(this, _additionalRequestContext)[_additionalRequestContext].operationName,
        requestId: 'offlineContext_resourceId',
        routeKey: _classPrivateFieldLooseBase(this, _routeKey)[_routeKey],
        stage: _classPrivateFieldLooseBase(this, _stage)[_stage],
        time: requestTime,
        timeEpoch: requestTimeEpoch
      },
      body,
      pathParameters: (0, _index.nullIfEmpty)(pathParams),
      isBase64Encoded: false,
      stageVariables: _classPrivateFieldLooseBase(this, _stageVariables)[_stageVariables]
    };
  }

}

exports.default = LambdaProxyIntegrationEventV2;