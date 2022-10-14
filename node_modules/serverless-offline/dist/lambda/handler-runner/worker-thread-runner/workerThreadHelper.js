"use strict";

var _process = require("process");

var _worker_threads = require("worker_threads");

var _index = _interopRequireDefault(require("../in-process-runner/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-line import/no-unresolved
const {
  functionKey,
  handlerName,
  handlerPath
} = _worker_threads.workerData;

_worker_threads.parentPort.on('message', async messageData => {
  const {
    context,
    event,
    port,
    timeout,
    allowCache
  } = messageData; // TODO we could probably cache this in the module scope?

  const inProcessRunner = new _index.default(functionKey, handlerPath, handlerName, _process.env, timeout, allowCache);
  const result = await inProcessRunner.run(event, context); // TODO check serializeability (contains function, symbol etc)

  port.postMessage(result);
});