"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _os = require("os");

var _process = _interopRequireDefault(require("process"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _javaInvokeLocal = require("java-invoke-local");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const {
  parse,
  stringify
} = JSON;
const {
  has
} = Reflect;

var _env = /*#__PURE__*/_classPrivateFieldLooseKey("env");

var _functionName = /*#__PURE__*/_classPrivateFieldLooseKey("functionName");

var _handler = /*#__PURE__*/_classPrivateFieldLooseKey("handler");

var _deployPackage = /*#__PURE__*/_classPrivateFieldLooseKey("deployPackage");

var _allowCache = /*#__PURE__*/_classPrivateFieldLooseKey("allowCache");

class JavaRunner {
  constructor(funOptions, env, allowCache, v3Utils) {
    Object.defineProperty(this, _env, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _functionName, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _handler, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _deployPackage, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _allowCache, {
      writable: true,
      value: false
    });
    const {
      functionName,
      handler,
      servicePackage,
      functionPackage
    } = funOptions;
    _classPrivateFieldLooseBase(this, _env)[_env] = env;
    _classPrivateFieldLooseBase(this, _functionName)[_functionName] = functionName;
    _classPrivateFieldLooseBase(this, _handler)[_handler] = handler;
    _classPrivateFieldLooseBase(this, _deployPackage)[_deployPackage] = functionPackage || servicePackage;
    _classPrivateFieldLooseBase(this, _allowCache)[_allowCache] = allowCache;

    if (v3Utils) {
      this.log = v3Utils.log;
      this.progress = v3Utils.progress;
      this.writeText = v3Utils.writeText;
      this.v3Utils = v3Utils;
    }
  } // no-op
  // () => void


  cleanup() {}

  _parsePayload(value) {
    for (const item of value.split(_os.EOL)) {
      let json; // first check if it's JSON

      try {
        json = parse(item); // nope, it's not JSON
      } catch (err) {// no-op
      } // now let's see if we have a property __offline_payload__


      if (json && typeof json === 'object' && has(json, '__offline_payload__')) {
        return json.__offline_payload__;
      }
    }

    return undefined;
  }

  async run(event, context) {
    const input = stringify({
      context,
      event
    });
    let result;

    try {
      // Assume java-invoke-local server is running
      const data = stringify({
        artifact: _classPrivateFieldLooseBase(this, _deployPackage)[_deployPackage],
        handler: _classPrivateFieldLooseBase(this, _handler)[_handler],
        data: input,
        function: _classPrivateFieldLooseBase(this, _functionName)[_functionName],
        jsonOutput: true,
        serverlessOffline: true
      });
      const httpOptions = {
        method: 'POST',
        body: data
      };
      const port = _process.default.env.JAVA_OFFLINE_SERVER || 8080;
      const response = await (0, _nodeFetch.default)(`http://localhost:${port}/invoke`, httpOptions);
      result = await response.text();
    } catch (e) {
      if (this.log) {
        this.log.notice('Local java server not running. For faster local invocations, run "java-invoke-local --server" in your project directory');
      } else {
        console.log('Local java server not running. For faster local invocations, run "java-invoke-local --server" in your project directory');
      } // Fallback invocation


      const args = ['-c', _classPrivateFieldLooseBase(this, _handler)[_handler], '-a', _classPrivateFieldLooseBase(this, _deployPackage)[_deployPackage], '-f', _classPrivateFieldLooseBase(this, _functionName)[_functionName], '-d', input, '--json-output', '--serverless-offline'];
      result = (0, _javaInvokeLocal.invokeJavaLocal)(args, _classPrivateFieldLooseBase(this, _env)[_env]);

      if (this.log) {
        this.log.notice(result);
      } else {
        console.log(result);
      }
    }

    return this._parsePayload(result);
  }

}

exports.default = JavaRunner;