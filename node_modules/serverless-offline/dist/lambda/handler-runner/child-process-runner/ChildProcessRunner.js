"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _execa = require("execa");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const childProcessHelperPath = _path.default.resolve(__dirname, 'childProcessHelper.js');

var _env = /*#__PURE__*/_classPrivateFieldLooseKey("env");

var _functionKey = /*#__PURE__*/_classPrivateFieldLooseKey("functionKey");

var _handlerName = /*#__PURE__*/_classPrivateFieldLooseKey("handlerName");

var _handlerPath = /*#__PURE__*/_classPrivateFieldLooseKey("handlerPath");

var _timeout = /*#__PURE__*/_classPrivateFieldLooseKey("timeout");

var _allowCache = /*#__PURE__*/_classPrivateFieldLooseKey("allowCache");

class ChildProcessRunner {
  constructor(funOptions, env, allowCache, v3Utils) {
    Object.defineProperty(this, _env, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _functionKey, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _handlerName, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _handlerPath, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _timeout, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _allowCache, {
      writable: true,
      value: false
    });
    const {
      functionKey,
      handlerName,
      handlerPath,
      timeout
    } = funOptions;

    if (v3Utils) {
      this.log = v3Utils.log;
      this.progress = v3Utils.progress;
      this.writeText = v3Utils.writeText;
      this.v3Utils = v3Utils;
    }

    _classPrivateFieldLooseBase(this, _env)[_env] = env;
    _classPrivateFieldLooseBase(this, _functionKey)[_functionKey] = functionKey;
    _classPrivateFieldLooseBase(this, _handlerName)[_handlerName] = handlerName;
    _classPrivateFieldLooseBase(this, _handlerPath)[_handlerPath] = handlerPath;
    _classPrivateFieldLooseBase(this, _timeout)[_timeout] = timeout;
    _classPrivateFieldLooseBase(this, _allowCache)[_allowCache] = allowCache;
  } // no-op
  // () => void


  cleanup() {}

  async run(event, context) {
    const childProcess = (0, _execa.node)(childProcessHelperPath, [_classPrivateFieldLooseBase(this, _functionKey)[_functionKey], _classPrivateFieldLooseBase(this, _handlerName)[_handlerName], _classPrivateFieldLooseBase(this, _handlerPath)[_handlerPath]], {
      env: _classPrivateFieldLooseBase(this, _env)[_env],
      stdio: 'inherit'
    });
    const message = new Promise((resolve, reject) => {
      childProcess.on('message', data => {
        if (data.error) reject(data.error);else resolve(data);
      });
    }).finally(() => {
      childProcess.kill();
    });
    childProcess.send({
      context,
      event,
      allowCache: _classPrivateFieldLooseBase(this, _allowCache)[_allowCache],
      timeout: _classPrivateFieldLooseBase(this, _timeout)[_timeout]
    });
    let result;

    try {
      result = await message;
    } catch (err) {
      // TODO
      if (this.log) {
        this.log.error(err);
      } else {
        console.log(err);
      }

      throw err;
    }

    return result;
  }

}

exports.default = ChildProcessRunner;