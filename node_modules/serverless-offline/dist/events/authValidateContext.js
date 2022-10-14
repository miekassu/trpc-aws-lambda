"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = authValidateContext;

var _boom = _interopRequireDefault(require("@hapi/boom"));

var _serverlessLog = _interopRequireDefault(require("../serverlessLog.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  keys,
  values
} = Object;

function internalServerError(message) {
  const errorType = 'AuthorizerConfigurationException';

  const error = _boom.default.internal();

  error.output.payload.message = message;
  error.output.payload.error = errorType;
  error.output.headers['x-amzn-ErrorType'] = errorType;
  return error;
}

function isValidContext(context) {
  return values(context).every(i => typeof i === 'string' || typeof i === 'boolean' || typeof i === 'number');
}

function transform(context) {
  keys(context).forEach(i => {
    context[i] = context[i].toString();
  });
  return context;
}

function authValidateContext(context, authFunName) {
  if (typeof context !== 'object') {
    return internalServerError('Authorizer response context must be an object');
  }

  if (!isValidContext(context)) {
    const error = 'Authorizer response context values must be of type string, number, or boolean';
    (0, _serverlessLog.default)(`Detected invalid value types returned in authorizer context: (λ: ${authFunName}). ${error}. ` + 'More info: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-lambda-authorizer-output.html');
    return internalServerError(error);
  }

  return transform(context);
}