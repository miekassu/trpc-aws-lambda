"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = require("fs");

var _os = require("os");

var _path = require("path");

var _process = _interopRequireWildcard(require("process"));

var _execa = _interopRequireWildcard(require("execa"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const {
  writeFile,
  readFile,
  mkdir,
  rmdir
} = _fs.promises;
const {
  parse,
  stringify
} = JSON;
const PAYLOAD_IDENTIFIER = 'offline_payload';

var _env = /*#__PURE__*/_classPrivateFieldLooseKey("env");

var _handlerPath = /*#__PURE__*/_classPrivateFieldLooseKey("handlerPath");

var _tmpPath = /*#__PURE__*/_classPrivateFieldLooseKey("tmpPath");

var _tmpFile = /*#__PURE__*/_classPrivateFieldLooseKey("tmpFile");

var _goEnv = /*#__PURE__*/_classPrivateFieldLooseKey("goEnv");

var _codeDir = /*#__PURE__*/_classPrivateFieldLooseKey("codeDir");

class GoRunner {
  constructor(funOptions, env, v3Utils) {
    Object.defineProperty(this, _env, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _handlerPath, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _tmpPath, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _tmpFile, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _goEnv, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _codeDir, {
      writable: true,
      value: null
    });
    const {
      handlerPath,
      codeDir
    } = funOptions;
    _classPrivateFieldLooseBase(this, _env)[_env] = env;
    _classPrivateFieldLooseBase(this, _handlerPath)[_handlerPath] = handlerPath;
    _classPrivateFieldLooseBase(this, _codeDir)[_codeDir] = codeDir;

    if (v3Utils) {
      this.log = v3Utils.log;
      this.progress = v3Utils.progress;
      this.writeText = v3Utils.writeText;
      this.v3Utils = v3Utils;
    }
  }

  async cleanup() {
    try {
      await rmdir(_classPrivateFieldLooseBase(this, _tmpPath)[_tmpPath], {
        recursive: true
      });
    } catch (e) {// @ignore
    }

    _classPrivateFieldLooseBase(this, _tmpFile)[_tmpFile] = null;
    _classPrivateFieldLooseBase(this, _tmpPath)[_tmpPath] = null;
  }

  _parsePayload(value) {
    const log = [];
    let payload;

    for (const item of value.split(_os.EOL)) {
      if (item.indexOf(PAYLOAD_IDENTIFIER) === -1) {
        log.push(item);
      } else if (item.indexOf(PAYLOAD_IDENTIFIER) !== -1) {
        try {
          const {
            offline_payload: {
              success,
              error
            }
          } = parse(item);

          if (success) {
            payload = success;
          } else if (error) {
            payload = error;
          }
        } catch (err) {// @ignore
        }
      }
    } // Log to console in case engineers want to see the rest of the info


    if (this.log) {
      this.log(log.join(_os.EOL));
    } else {
      console.log(log.join(_os.EOL));
    }

    return payload;
  }

  async run(event, context) {
    const {
      dir
    } = (0, _path.parse)(_classPrivateFieldLooseBase(this, _handlerPath)[_handlerPath]);
    const handlerCodeRoot = dir.split(_path.sep).slice(0, -1).join(_path.sep);
    const handlerCode = await readFile(`${_classPrivateFieldLooseBase(this, _handlerPath)[_handlerPath]}.go`, 'utf8');
    _classPrivateFieldLooseBase(this, _tmpPath)[_tmpPath] = (0, _path.resolve)(handlerCodeRoot, 'tmp');
    _classPrivateFieldLooseBase(this, _tmpFile)[_tmpFile] = (0, _path.resolve)(_classPrivateFieldLooseBase(this, _tmpPath)[_tmpPath], 'main.go');
    const out = handlerCode.replace('"github.com/aws/aws-lambda-go/lambda"', 'lambda "github.com/icarus-sullivan/mock-lambda"');

    try {
      await mkdir(_classPrivateFieldLooseBase(this, _tmpPath)[_tmpPath], {
        recursive: true
      });
    } catch (e) {// @ignore
    }

    try {
      await writeFile(_classPrivateFieldLooseBase(this, _tmpFile)[_tmpFile], out, 'utf8');
    } catch (e) {// @ignore
    } // Get go env to run this locally


    if (!_classPrivateFieldLooseBase(this, _goEnv)[_goEnv]) {
      const goEnvResponse = await (0, _execa.default)('go', ['env'], {
        stdio: 'pipe',
        encoding: 'utf-8'
      });
      const goEnvString = goEnvResponse.stdout || goEnvResponse.stderr;
      _classPrivateFieldLooseBase(this, _goEnv)[_goEnv] = goEnvString.split(_os.EOL).reduce((a, b) => {
        const [k, v] = b.split('="'); // eslint-disable-next-line no-param-reassign

        a[k] = v ? v.slice(0, -1) : '';
        return a;
      }, {});
    } // Remove our root, since we want to invoke go relatively


    const cwdPath = `${_classPrivateFieldLooseBase(this, _tmpFile)[_tmpFile]}`.replace(`${(0, _process.cwd)()}${_path.sep}`, '');

    try {
      (0, _process.chdir)(cwdPath.substring(0, cwdPath.indexOf('main.go'))); // Make sure we have the mock-lambda runner

      (0, _execa.sync)('go', ['get', 'github.com/icarus-sullivan/mock-lambda@e065469']);
      (0, _execa.sync)('go', ['build']);
    } catch (e) {// @ignore
    }

    const {
      stdout,
      stderr
    } = await (0, _execa.default)(`./tmp`, {
      stdio: 'pipe',
      env: { ..._classPrivateFieldLooseBase(this, _env)[_env],
        ..._classPrivateFieldLooseBase(this, _goEnv)[_goEnv],
        AWS_LAMBDA_LOG_GROUP_NAME: context.logGroupName,
        AWS_LAMBDA_LOG_STREAM_NAME: context.logStreamName,
        AWS_LAMBDA_FUNCTION_NAME: context.functionName,
        AWS_LAMBDA_FUNCTION_MEMORY_SIZE: context.memoryLimitInMB,
        AWS_LAMBDA_FUNCTION_VERSION: context.functionVersion,
        LAMBDA_EVENT: stringify(event),
        LAMBDA_TEST_EVENT: `${event}`,
        LAMBDA_CONTEXT: stringify(context),
        IS_LAMBDA_AUTHORIZER: event.type === 'REQUEST' || event.type === 'TOKEN',
        IS_LAMBDA_REQUEST_AUTHORIZER: event.type === 'REQUEST',
        IS_LAMBDA_TOKEN_AUTHORIZER: event.type === 'TOKEN',
        PATH: _process.default.env.PATH
      },
      encoding: 'utf-8'
    });
    await this.cleanup();

    if (stderr) {
      return stderr;
    }

    try {
      // refresh go.mod
      (0, _execa.sync)('go', ['mod', 'tidy']);
      (0, _process.chdir)(_classPrivateFieldLooseBase(this, _codeDir)[_codeDir]);
    } catch (e) {// @ignore
    }

    return this._parsePayload(stdout);
  }

}

exports.default = GoRunner;