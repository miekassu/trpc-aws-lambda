"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = renderVelocityTemplateObject;

var _velocityjs = require("velocityjs");

var _javaHelpers = _interopRequireDefault(require("../javaHelpers.js"));

var _debugLog = _interopRequireDefault(require("../../../debugLog.js"));

var _index = require("../../../utils/index.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  parse
} = JSON;
const {
  entries
} = Object;

function tryToParseJSON(string) {
  let parsed;

  try {
    parsed = parse(string);
  } catch (err) {// nothing! Some things are not meant to be parsed.
  }

  return parsed || string;
}

function renderVelocityString(velocityString, context, v3Utils) {
  const log = v3Utils && v3Utils.log; // runs in a "polluted" (extended) String.prototype replacement scope

  const renderResult = (0, _javaHelpers.default)(() => // This line can throw, but this function does not handle errors
  // Quick args explanation:
  // { escape: false } --> otherwise would escape &, < and > chars with html (&amp;, &lt; and &gt;)
  // render(context, null, true) --> null: no custom macros; true: silent mode, just like APIG
  new _velocityjs.Compile((0, _velocityjs.parse)(velocityString), {
    escape: false
  }).render(context, null, true));

  if (log) {
    log.debug('Velocity rendered:', renderResult || 'undefined');
  } else {
    (0, _debugLog.default)('Velocity rendered:', renderResult || 'undefined');
  } // Haaaa Velocity... this language sure loves strings a lot


  switch (renderResult) {
    case 'undefined':
      return undefined;
    // But we don't, we want JavaScript types

    case 'null':
      return null;

    case 'true':
      return true;

    case 'false':
      return false;

    default:
      return tryToParseJSON(renderResult);
  }
}
/*
  Deeply traverses a Serverless-style JSON (Velocity) template
  When it finds a string, assumes it's Velocity language and renders it.
*/


function renderVelocityTemplateObject(templateObject, context, v3Utils) {
  const result = {};
  const log = v3Utils && v3Utils.log;
  let toProcess = templateObject; // In some projects, the template object is a string, let us see if it's JSON

  if (typeof toProcess === 'string') {
    toProcess = tryToParseJSON(toProcess);
  } // Let's check again


  if ((0, _index.isPlainObject)(toProcess)) {
    entries(toProcess).forEach(([key, value]) => {
      if (log) {
        log.debug('Processing key:', key, '- value:', value);
      } else {
        (0, _debugLog.default)('Processing key:', key, '- value:', value);
      }

      if (typeof value === 'string') {
        result[key] = renderVelocityString(value, context, v3Utils); // Go deeper
      } else if ((0, _index.isPlainObject)(value)) {
        result[key] = renderVelocityTemplateObject(value, context); // This should never happen: value should either be a string or a plain object
      } else {
        result[key] = value;
      }
    }); // Still a string? Maybe it's some complex Velocity stuff
  } else if (typeof toProcess === 'string') {
    // If the plugin threw here then you should consider reviewing your template or posting an issue.
    const alternativeResult = tryToParseJSON(renderVelocityString(toProcess, context, v3Utils));
    return (0, _index.isPlainObject)(alternativeResult) ? alternativeResult : result;
  }

  return result;
}