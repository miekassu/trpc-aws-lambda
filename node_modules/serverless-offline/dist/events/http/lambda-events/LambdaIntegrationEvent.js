"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _process = require("process");

var _renderVelocityTemplateObject = _interopRequireDefault(require("./renderVelocityTemplateObject.js"));

var _VelocityContext = _interopRequireDefault(require("./VelocityContext.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const {
  parse
} = JSON;

var _path = /*#__PURE__*/_classPrivateFieldLooseKey("path");

var _request = /*#__PURE__*/_classPrivateFieldLooseKey("request");

var _requestTemplate = /*#__PURE__*/_classPrivateFieldLooseKey("requestTemplate");

var _stage = /*#__PURE__*/_classPrivateFieldLooseKey("stage");

class LambdaIntegrationEvent {
  constructor(request, stage, requestTemplate, path, v3Utils) {
    Object.defineProperty(this, _path, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _request, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _requestTemplate, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _stage, {
      writable: true,
      value: null
    });
    _classPrivateFieldLooseBase(this, _path)[_path] = path;
    _classPrivateFieldLooseBase(this, _request)[_request] = request;
    _classPrivateFieldLooseBase(this, _requestTemplate)[_requestTemplate] = requestTemplate;
    _classPrivateFieldLooseBase(this, _stage)[_stage] = stage;
    this.v3Utils = v3Utils;
  }

  create() {
    if (_process.env.AUTHORIZER) {
      try {
        const authorizerContext = parse(_process.env.AUTHORIZER);

        if (authorizerContext) {
          _classPrivateFieldLooseBase(this, _request)[_request].auth = { ..._classPrivateFieldLooseBase(this, _request)[_request].auth,
            credentials: {
              authorizer: authorizerContext
            }
          };
        }
      } catch (error) {
        if (this.log) {
          this.log.error('Could not parse process.env.AUTHORIZER, make sure it is correct JSON');
        } else {
          console.error('Serverless-offline: Could not parse process.env.AUTHORIZER, make sure it is correct JSON.');
        }
      }
    }

    const velocityContext = new _VelocityContext.default(_classPrivateFieldLooseBase(this, _request)[_request], _classPrivateFieldLooseBase(this, _stage)[_stage], _classPrivateFieldLooseBase(this, _request)[_request].payload || {}, _classPrivateFieldLooseBase(this, _path)[_path]).getContext();
    const event = (0, _renderVelocityTemplateObject.default)(_classPrivateFieldLooseBase(this, _requestTemplate)[_requestTemplate], velocityContext, this.v3Utils);
    return event;
  }

}

exports.default = LambdaIntegrationEvent;