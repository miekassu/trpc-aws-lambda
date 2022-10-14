"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _debugLog = _interopRequireDefault(require("../../debugLog.js"));

var _serverlessLog = require("../../serverlessLog.js");

var _index = require("../../config/index.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

var _env = /*#__PURE__*/_classPrivateFieldLooseKey("env");

var _funOptions = /*#__PURE__*/_classPrivateFieldLooseKey("funOptions");

var _options = /*#__PURE__*/_classPrivateFieldLooseKey("options");

var _runner = /*#__PURE__*/_classPrivateFieldLooseKey("runner");

class HandlerRunner {
  constructor(funOptions, options, env, v3Utils) {
    Object.defineProperty(this, _env, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _funOptions, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _options, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _runner, {
      writable: true,
      value: null
    });
    _classPrivateFieldLooseBase(this, _env)[_env] = env;
    _classPrivateFieldLooseBase(this, _funOptions)[_funOptions] = funOptions;
    _classPrivateFieldLooseBase(this, _options)[_options] = options;

    if (v3Utils) {
      this.log = v3Utils.log;
      this.progress = v3Utils.progress;
      this.writeText = v3Utils.writeText;
      this.v3Utils = v3Utils;
    }
  }

  async _loadRunner() {
    const {
      useDocker,
      useChildProcesses,
      useWorkerThreads,
      allowCache
    } = _classPrivateFieldLooseBase(this, _options)[_options];

    const {
      functionKey,
      handlerName,
      handlerPath,
      runtime,
      timeout
    } = _classPrivateFieldLooseBase(this, _funOptions)[_funOptions];

    if (this.log) {
      this.log.debug(`Loading handler... (${handlerPath})`);
    } else {
      (0, _debugLog.default)(`Loading handler... (${handlerPath})`);
    }

    if (useDocker) {
      // https://github.com/lambci/docker-lambda/issues/329
      if (runtime === 'nodejs14.x') {
        if (this.log) {
          this.log.warning('"nodejs14.x" runtime is not supported with docker. See https://github.com/lambci/docker-lambda/issues/329');
        } else {
          (0, _serverlessLog.logWarning)('"nodejs14.x" runtime is not supported with docker. See https://github.com/lambci/docker-lambda/issues/329');
        }

        throw new Error('Unsupported runtime');
      }

      if (runtime === 'python3.9') {
        if (this.log) {
          this.log.warning('"python3.9" runtime is not supported with docker.');
        } else {
          (0, _serverlessLog.logWarning)('"python3.9" runtime is not supported with docker.');
        }

        throw new Error('Unsupported runtime');
      }

      const dockerOptions = {
        host: _classPrivateFieldLooseBase(this, _options)[_options].dockerHost,
        hostServicePath: _classPrivateFieldLooseBase(this, _options)[_options].dockerHostServicePath,
        layersDir: _classPrivateFieldLooseBase(this, _options)[_options].layersDir,
        network: _classPrivateFieldLooseBase(this, _options)[_options].dockerNetwork,
        readOnly: _classPrivateFieldLooseBase(this, _options)[_options].dockerReadOnly
      };
      const {
        default: DockerRunner
      } = await Promise.resolve().then(() => _interopRequireWildcard(require('./docker-runner/index.js')));
      return new DockerRunner(_classPrivateFieldLooseBase(this, _funOptions)[_funOptions], _classPrivateFieldLooseBase(this, _env)[_env], dockerOptions, this.v3Utils);
    }

    if (_index.supportedNodejs.has(runtime)) {
      if (useChildProcesses) {
        const {
          default: ChildProcessRunner
        } = await Promise.resolve().then(() => _interopRequireWildcard(require('./child-process-runner/index.js')));
        return new ChildProcessRunner(_classPrivateFieldLooseBase(this, _funOptions)[_funOptions], _classPrivateFieldLooseBase(this, _env)[_env], allowCache, this.v3Utils);
      }

      if (useWorkerThreads) {
        const {
          default: WorkerThreadRunner
        } = await Promise.resolve().then(() => _interopRequireWildcard(require('./worker-thread-runner/index.js')));
        return new WorkerThreadRunner(_classPrivateFieldLooseBase(this, _funOptions)[_funOptions], _classPrivateFieldLooseBase(this, _env)[_env], allowCache);
      }

      const {
        default: InProcessRunner
      } = await Promise.resolve().then(() => _interopRequireWildcard(require('./in-process-runner/index.js')));
      return new InProcessRunner(functionKey, handlerPath, handlerName, _classPrivateFieldLooseBase(this, _env)[_env], timeout, allowCache);
    }

    if (_index.supportedGo.has(runtime)) {
      const {
        default: GoRunner
      } = await Promise.resolve().then(() => _interopRequireWildcard(require('./go-runner/index.js')));
      return new GoRunner(_classPrivateFieldLooseBase(this, _funOptions)[_funOptions], _classPrivateFieldLooseBase(this, _env)[_env], this.v3Utils);
    }

    if (_index.supportedPython.has(runtime)) {
      const {
        default: PythonRunner
      } = await Promise.resolve().then(() => _interopRequireWildcard(require('./python-runner/index.js')));
      return new PythonRunner(_classPrivateFieldLooseBase(this, _funOptions)[_funOptions], _classPrivateFieldLooseBase(this, _env)[_env], allowCache, this.v3Utils);
    }

    if (_index.supportedRuby.has(runtime)) {
      const {
        default: RubyRunner
      } = await Promise.resolve().then(() => _interopRequireWildcard(require('./ruby-runner/index.js')));
      return new RubyRunner(_classPrivateFieldLooseBase(this, _funOptions)[_funOptions], _classPrivateFieldLooseBase(this, _env)[_env], allowCache, this.v3Utils);
    }

    if (_index.supportedJava.has(runtime)) {
      const {
        default: JavaRunner
      } = await Promise.resolve().then(() => _interopRequireWildcard(require('./java-runner/index.js')));
      return new JavaRunner(_classPrivateFieldLooseBase(this, _funOptions)[_funOptions], _classPrivateFieldLooseBase(this, _env)[_env], allowCache, this.v3Utils);
    } // TODO FIXME


    throw new Error('Unsupported runtime');
  } // TEMP TODO FIXME


  isDockerRunner() {
    return _classPrivateFieldLooseBase(this, _runner)[_runner] && _classPrivateFieldLooseBase(this, _runner)[_runner].constructor.name === 'DockerRunner';
  } // () => Promise<void>


  cleanup() {
    // TODO console.log('handler runner cleanup')
    return _classPrivateFieldLooseBase(this, _runner)[_runner].cleanup();
  }

  async run(event, context) {
    if (_classPrivateFieldLooseBase(this, _runner)[_runner] == null) {
      _classPrivateFieldLooseBase(this, _runner)[_runner] = await this._loadRunner();
    }

    return _classPrivateFieldLooseBase(this, _runner)[_runner].run(event, context);
  }

}

exports.default = HandlerRunner;