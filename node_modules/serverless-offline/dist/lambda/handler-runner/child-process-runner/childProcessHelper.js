"use strict";

var _process = _interopRequireWildcard(require("process"));

var _index = _interopRequireDefault(require("../in-process-runner/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// TODO handle this:
_process.default.on('uncaughtException', err => {
  const {
    constructor: {
      name
    },
    message,
    stack
  } = err;

  _process.default.send({
    // process.send() can't serialize an Error object, so we help it out a bit
    error: {
      constructor: {
        name
      },
      message,
      stack
    }
  });
});

const [,, functionKey, handlerName, handlerPath] = _process.argv;

_process.default.on('message', async messageData => {
  const {
    context,
    event,
    allowCache,
    timeout
  } = messageData; // TODO we could probably cache this in the module scope?

  const inProcessRunner = new _index.default(functionKey, handlerPath, handlerName, _process.default.env, timeout, allowCache);
  const result = await inProcessRunner.run(event, context); // TODO check serializeability (contains function, symbol etc)

  _process.default.send(result);
});